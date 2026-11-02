import "server-only";
import { col } from "@/lib/db/mongo";
import type { OrderDoc, ProductDoc } from "@/lib/db/types";

export interface DashboardStats {
  revenue: number;
  revenueThisMonth: number;
  orderCount: number;
  ordersThisMonth: number;
  pendingOrders: number;
  customers: number;
  newCustomers: number;
  products: number;
  lowStock: number;
  outOfStock: number;
  averageOrderValue: number;
  conversionRateLabel: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const orders = col<OrderDoc>("orders");
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [revenueAgg, revenueMonthAgg, orderCount, ordersThisMonth, pendingOrders, customers, newCustomers, products, lowStock, outOfStock] =
    await Promise.all([
      orders
        .aggregate<{ _id: null; total: number }>([
          { $match: { status: { $nin: ["cancelled", "returned"] } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ])
        .toArray(),
      orders
        .aggregate<{ _id: null; total: number }>([
          { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ])
        .toArray(),
      orders.countDocuments({ status: { $nin: ["cancelled", "returned"] } }),
      orders.countDocuments({ createdAt: { $gte: monthStart } }),
      orders.countDocuments({ status: { $in: ["pending", "confirmed", "processing"] } }),
      col("user").countDocuments({ role: { $in: [null, "customer"] } }),
      col("user").countDocuments({ createdAt: { $gte: prevMonthStart } }),
      col("products").countDocuments({ status: { $ne: "archived" } }),
      col("products").countDocuments({ stock: { $gt: 0, $lte: 5 }, status: "published" }),
      col("products").countDocuments({ stock: { $lte: 0 } }),
    ]);

  const revenue = revenueAgg[0]?.total ?? 0;

  return {
    revenue,
    revenueThisMonth: revenueMonthAgg[0]?.total ?? 0,
    orderCount,
    ordersThisMonth,
    pendingOrders,
    customers,
    newCustomers,
    products,
    lowStock,
    outOfStock,
    averageOrderValue: orderCount ? Math.round(revenue / orderCount) : 0,
    conversionRateLabel: "—",
  };
}

export async function getRevenueSeries(days = 30) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const rows = await col<OrderDoc>("orders")
    .aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: { createdAt: { $gte: from }, status: { $nin: ["cancelled", "returned"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  return rows.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders }));
}

export async function getTopProducts(limit = 5) {
  return col<ProductDoc>("products")
    .find({ status: "published" })
    .sort({ soldCount: -1 })
    .limit(limit)
    .toArray();
}

export async function getLowStockProducts(limit = 8) {
  return col<ProductDoc>("products").find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(limit).toArray();
}

export async function getOrderStatusBreakdown() {
  const rows = await col<OrderDoc>("orders")
    .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();
  return rows.map((r) => ({ status: r._id, count: r.count }));
}

export async function getRecentOrders(limit = 6) {
  return col<OrderDoc>("orders").find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function getSalesReport(from: Date, to: Date) {
  const orders = await col<OrderDoc>("orders")
    .find({ createdAt: { $gte: from, $lte: to }, status: { $nin: ["cancelled"] } })
    .sort({ createdAt: -1 })
    .toArray();

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const byPayment = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + o.total;
    return acc;
  }, {});
  const productTotals = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const entry = productTotals.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
      entry.qty += item.quantity;
      entry.revenue += item.lineTotal;
      productTotals.set(item.productId, entry);
    }
  }
  return {
    orders,
    revenue: orders.reduce((s, o) => s + o.total, 0),
    byStatus,
    byPayment,
    topProducts: [...productTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
  };
}
