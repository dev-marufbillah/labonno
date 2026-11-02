import "server-only";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { OrderDoc } from "@/lib/db/types";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: Date;
  emailVerified: boolean;
  orderCount: number;
  spent: number;
  lastOrderAt?: Date | null;
}

interface UserRow {
  _id: ObjectId | string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt: Date;
  emailVerified?: boolean;
}

export async function listCustomers(search?: string): Promise<CustomerRecord[]> {
  const filter: Record<string, unknown> = { role: { $in: [null, "customer"] } };
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const users = await col<UserRow>("user").find(filter).sort({ createdAt: -1 }).limit(300).toArray();
  const emails = users.map((u) => u.email);
  const orderStats = await col<OrderDoc>("orders")
    .aggregate<{ _id: string; count: number; spent: number; last: Date }>([
      { $match: { "customer.email": { $in: emails }, status: { $ne: "cancelled" } } },
      { $group: { _id: "$customer.email", count: { $sum: 1 }, spent: { $sum: "$total" }, last: { $max: "$createdAt" } } },
    ])
    .toArray();
  const statsByEmail = new Map(orderStats.map((s) => [s._id, s]));

  return users.map((u) => {
    const stats = statsByEmail.get(u.email);
    return {
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role ?? "customer",
      createdAt: u.createdAt,
      emailVerified: Boolean(u.emailVerified),
      orderCount: stats?.count ?? 0,
      spent: stats?.spent ?? 0,
      lastOrderAt: stats?.last ?? null,
    };
  });
}

export async function getCustomerDetail(id: string) {
  if (!ObjectId.isValid(id) && !/^[\w-]{10,}$/.test(id)) return null;
  const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
  const user = await col<UserRow & { _id: ObjectId | string }>("user").findOne(filter as never);
  if (!user) return null;
  const orders = await col<OrderDoc>("orders").find({ "customer.email": user.email }).sort({ createdAt: -1 }).toArray();
  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role ?? "customer",
      createdAt: user.createdAt,
      emailVerified: Boolean(user.emailVerified),
    },
    orders,
    spent: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
  };
}

export async function listAdminUsers() {
  return col("user")
    .find({ role: { $in: ["admin", "super_admin"] } })
    .sort({ createdAt: 1 })
    .toArray();
}
