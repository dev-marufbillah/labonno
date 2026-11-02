import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { getOrdersForUser } from "@/lib/services/orders";
import { formatMoney, formatDate } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My orders", robots: { index: false, follow: false } };

export default async function OrdersPage() {
  const user = await requireUser("/login?next=/account/orders");
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light">My orders</h1>
        <p className="mt-1 text-[13px] text-ink-muted">{orders.length} order(s) placed with this account.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your orders and their status will appear here." actionLabel="Browse the collection" actionHref="/shop" />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={String(order._id)} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
                <div>
                  <Link href={`/account/orders/${order._id}`} className="font-serif text-lg hover:text-gold-dark">
                    {order.orderNumber}
                  </Link>
                  <p className="text-[11.5px] text-ink-muted">
                    {formatDate(order.createdAt)} · {order.items.length} item(s) · {formatMoney(order.total)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.paymentStatus} kind="payment" />
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {order.items.map((item) => (
                  <li key={`${item.productId}-${item.size}`} className="flex justify-between gap-4 text-[12.5px] text-ink-soft">
                    <span>
                      {item.name} <span className="text-ink-muted">· {item.size} · ×{item.quantity}</span>
                    </span>
                    <span>{formatMoney(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-3">
                <Link href={`/account/orders/${order._id}`} className="text-[10px] uppercase tracking-label text-ink underline underline-offset-4">
                  Order details
                </Link>
                <Link href={`/track-order?order=${order.orderNumber}`} className="text-[10px] uppercase tracking-label text-ink-muted underline underline-offset-4 hover:text-ink">
                  Track
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
