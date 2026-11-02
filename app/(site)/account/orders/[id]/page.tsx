import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { getOrderForUser } from "@/lib/services/orders";
import { formatMoney, formatDateTime } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/config/site";
import { StatusBadge } from "@/components/ui/badge";
import { CancelOrderButton } from "@/components/site/cancel-order-button";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/login?next=/account/orders");
  const { id } = await params;
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/account/orders" className="text-[10px] uppercase tracking-label text-ink-muted hover:text-ink">
            ← All orders
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-light">{order.orderNumber}</h1>
          <p className="mt-1 text-[12.5px] text-ink-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge value={order.status} />
          <StatusBadge value={order.paymentStatus} kind="payment" />
          {["pending", "confirmed"].includes(order.status) ? <CancelOrderButton orderId={String(order._id)} /> : null}
        </div>
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-cream-200">
              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1">
              <Link href={`/products/${item.slug}`} className="font-serif text-[15px] hover:text-gold-dark">
                {item.name}
              </Link>
              <p className="text-[11px] uppercase tracking-wide2 text-ink-muted">
                {item.size} · {item.color} · SKU {item.sku}
              </p>
              <p className="mt-1 text-[12px]">Qty {item.quantity}</p>
            </div>
            <p className="text-[13px]">{formatMoney(item.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-surface p-5">
          <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Delivery address</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            {order.customer.name}
            <br />
            {order.shippingAddress.address}, {order.shippingAddress.area}
            <br />
            {order.shippingAddress.district} {order.shippingAddress.postcode}
            <br />
            {order.customer.phone}
          </p>
          {order.shippingAddress.note ? (
            <p className="mt-3 rounded bg-cream-200/60 p-2.5 text-[11.5px] text-ink-soft">Note: {order.shippingAddress.note}</p>
          ) : null}
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Payment</p>
          <p className="mt-2 text-[13px] text-ink-soft">{PAYMENT_METHOD_LABELS[order.paymentMethod]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
          {order.paymentRef?.transactionId ? (
            <p className="mt-1 text-[11.5px] text-ink-muted">Transaction: {order.paymentRef.transactionId}</p>
          ) : null}
          <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-[12.5px]">
            <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
            {order.discount > 0 ? <div className="flex justify-between"><dt className="text-ink-muted">Discount</dt><dd>−{formatMoney(order.discount)}</dd></div> : null}
            <div className="flex justify-between"><dt className="text-ink-muted">Delivery</dt><dd>{order.deliveryCharge === 0 ? "Free" : formatMoney(order.deliveryCharge)}</dd></div>
            <div className="flex justify-between font-serif text-base"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="card-surface p-5">
        <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Order history</p>
        <ul className="mt-3 space-y-2">
          {order.statusHistory.map((entry, index) => (
            <li key={index} className="flex justify-between gap-4 text-[12.5px] text-ink-soft">
              <span className="capitalize">{ORDER_STATUS_LABELS[entry.status] ?? entry.status}{entry.note ? ` — ${entry.note}` : ""}</span>
              <span className="shrink-0 text-ink-muted">{formatDateTime(entry.at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
