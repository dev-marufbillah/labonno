import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Package, Plus } from "lucide-react";
import {
  getDashboardStats,
  getLowStockProducts,
  getOrderStatusBreakdown,
  getRecentOrders,
  getRevenueSeries,
  getTopProducts,
} from "@/lib/services/reports";
import { AdminPageTitle, Panel, StatCard } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusChart } from "@/components/admin/order-status-chart";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, series, statusBreakdown, recentOrders, lowStock, topProducts] = await Promise.all([
    getDashboardStats(),
    getRevenueSeries(30),
    getOrderStatusBreakdown(),
    getRecentOrders(6),
    getLowStockProducts(5),
    getTopProducts(4),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Studio overview"
        description="A live view of orders, revenue and stock across the house."
        action={
          <div className="flex gap-2">
            <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft">
              <Plus className="size-3" /> Add product
            </Link>
            <Link href="/admin/site" className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-[10px] uppercase tracking-label text-ink transition hover:border-gold">
              Everything on the site
            </Link>
            <Link href="/admin/orders" className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-[10px] uppercase tracking-label text-ink transition hover:border-ink">
              Orders <ArrowUpRight className="size-3" />
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatMoney(stats.revenue)} hint={`${formatMoney(stats.revenueThisMonth)} this month`} tone="positive" href="/admin/reports" />
        <StatCard label="Orders" value={formatNumber(stats.orderCount)} hint={`${stats.pendingOrders} awaiting action`} href="/admin/orders" />
        <StatCard label="Average order" value={formatMoney(stats.averageOrderValue)} hint={`${stats.ordersThisMonth} orders this month`} href="/admin/reports" />
        <StatCard label="Customers" value={formatNumber(stats.customers)} hint={`${stats.newCustomers} joined in 30 days`} href="/admin/customers" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Revenue · last 30 days" description="Excludes cancelled and returned orders">
          <RevenueChart data={series} />
        </Panel>
        <div className="space-y-4">
          <Panel title="Orders by status">
            <OrderStatusChart data={statusBreakdown} />
          </Panel>
          <Panel title="Stock alerts" action={<Link href="/admin/inventory" className="text-[10px] uppercase tracking-wide2 text-gold-dark hover:underline">Manage</Link>}>
            <ul className="space-y-2.5">
              {lowStock.length === 0 ? (
                <li className="text-[12px] text-ink-muted">All products are comfortably stocked.</li>
              ) : (
                lowStock.map((product) => (
                  <li key={String(product._id)} className="flex items-center justify-between gap-2">
                    <Link href={`/admin/products/${product._id}`} className="truncate text-[12.5px] text-ink hover:text-gold-dark">
                      {product.name}
                    </Link>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${product.stock <= 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {product.stock} left
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Recent orders" action={<Link href="/admin/orders" className="text-[10px] uppercase tracking-wide2 text-gold-dark hover:underline">View all</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[12.5px]">
              <thead className="border-b border-line text-[9.5px] uppercase tracking-wide2 text-ink-muted">
                <tr>
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Customer</th>
                  <th className="py-2 pr-3 font-medium">Total</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={String(order._id)} className="border-b border-line/60">
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/orders/${order._id}`} className="hover:text-gold-dark">{order.orderNumber}</Link>
                      <p className="text-[10px] text-ink-muted">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="truncate">{order.customer.name}</p>
                      <p className="text-[10px] text-ink-muted">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                    </td>
                    <td className="py-2.5 pr-3">{formatMoney(order.total)}</td>
                    <td className="py-2.5 pr-3"><StatusBadge value={order.status} /></td>
                  </tr>
                ))}
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-ink-muted">No orders yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Best sellers" action={<Link href="/admin/products" className="text-[10px] uppercase tracking-wide2 text-gold-dark hover:underline">All products</Link>}>
          <ul className="space-y-3">
            {topProducts.map((product) => (
              <li key={String(product._id)} className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-cream-200 text-ink-muted">
                  <Package className="size-3.5" strokeWidth={1.4} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${product._id}`} className="block truncate text-[12.5px] hover:text-gold-dark">
                    {product.name}
                  </Link>
                  <p className="text-[10px] text-ink-muted">{product.soldCount} sold · {formatMoney(product.salePrice ?? product.price)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
