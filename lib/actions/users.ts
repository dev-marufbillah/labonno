"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { Role } from "@/lib/db/types";
import { audit, fail, requireActor, type ActionState } from "./helpers";

export async function setUserRole(userId: string, role: Role): Promise<ActionState> {
  try {
    const actor = await requireActor("super_admin");
    if (actor.id === userId) return { ok: false, message: "You cannot change your own role." };
    const filter = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { _id: userId };
    const result = await col("user").updateOne(filter as never, { $set: { role, updatedAt: new Date() } });
    if (result.matchedCount === 0) return { ok: false, message: "User not found." };
    await audit(actor.email, "user.role", `user:${userId}`, { role });
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { ok: true, message: `Role updated to ${role.replace("_", " ")}.` };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Creates a staff account straight from the panel — no terminal, no seed script.
 * The password is hashed with the same helper Better Auth uses, so sign-in works
 * immediately, and the account is marked with the chosen role.
 */
export async function createStaffUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<ActionState> {
  try {
    const actor = await requireActor("super_admin");
    const email = input.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "Enter a valid email address." };
    if (input.password.length < 8) return { ok: false, message: "Use a password of at least 8 characters." };
    if (!input.name.trim()) return { ok: false, message: "Enter their name." };
    if (!["admin", "super_admin", "manager"].includes(input.role)) {
      return { ok: false, message: "Choose admin or super admin." };
    }

    const users = col("user");
    if (await users.findOne({ email } as never)) {
      return { ok: false, message: "An account with that email already exists." };
    }

    const { hashPassword } = await import("better-auth/crypto");
    const now = new Date();
    const inserted = await users.insertOne({
      name: input.name.trim(),
      email,
      emailVerified: true,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    } as never);

    await col("account").insertOne({
      userId: inserted.insertedId,
      providerId: "credential",
      accountId: String(inserted.insertedId),
      password: await hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
    } as never);

    await audit(actor.email, "user.create", email, { role: input.role });
    revalidatePath("/admin/users");
    return { ok: true, message: `${input.name.split(" ")[0]} can now sign in at /admin/login.` };
  } catch (error) {
    return fail(error);
  }
}

/** Removes a staff account. Guards: not yourself, and never the last super admin. */
export async function deleteStaffUser(userId: string): Promise<ActionState> {
  try {
    const actor = await requireActor("super_admin");
    if (actor.id === userId) return { ok: false, message: "You cannot delete your own account." };

    const users = col("user");
    const filter = (ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { _id: userId }) as never;
    const user = await users.findOne(filter);
    if (!user) return { ok: false, message: "User not found." };

    if ((user as { role?: string }).role === "super_admin") {
      const supers = await users.countDocuments({ role: "super_admin" } as never);
      if (supers <= 1) return { ok: false, message: "There must always be at least one super admin." };
    }

    await users.deleteOne(filter);
    await col("account").deleteMany({ userId: { $in: [userId, new ObjectId(userId)] } } as never);
    await col("session").deleteMany({ userId: { $in: [userId, new ObjectId(userId)] } } as never);

    await audit(actor.email, "user.delete", String((user as { email?: string }).email ?? userId));
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { ok: true, message: "Account deleted. Their past orders are kept for your records." };
  } catch (error) {
    return fail(error);
  }
}
