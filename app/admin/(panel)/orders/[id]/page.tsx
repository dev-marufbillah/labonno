import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/services/orders";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/badge";
import { OrderControls } from "@/components/admin/order-controls";
import { ResendEmailButton } from "@/components/admin/resend-email-button";
import { mailerSummary } from "@/lib/email/mailer";
import { getPaymentLabel } from "@/lib/services/payment-methods";
import { formatDateTime, formatMoney } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order details" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const [paymentLabel, mail] = await Promise.all([getPaymentLabel(order.paymentMethod), Promise.resolve(mailerSummary())]);

  return (
    <div>
      <AdminPageTitle
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)} · ${paymentLabel}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} kind="payment" />
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Panel title="Items">
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded bg-cream-200">
                    <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${item.slug}`} className="block truncate text-[13px] font-medium text-ink hover:text-gold-dark">
                      {item.name}
                    </Link>
                    <p className="text-[10.5px] text-ink-muted">{item.size} · {item.color} · {item.sku}</p>
                    <p className="text-[11.5px]">{formatMoney(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="text-[13px]">{formatMoney(item.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[12.5px]">
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-emerald-800"><dt>Discount {order.coupon?.code ? `(${order.coupon.code})` : ""}</dt><dd>−{formatMoney(order.discount)}</dd></div>
              ) : null}
              <div className="flex justify-between"><dt className="text-ink-muted">Delivery</dt><dd>{order.deliveryCharge === 0 ? "Free" : formatMoney(order.deliveryCharge)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 font-serif text-lg"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
            </dl>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Customer">
              <p className="text-[13px] text-ink">{order.customer.name}</p>
              <p className="text-[12px] text-ink-muted">{order.customer.email}</p>
              <p className="text-[12px] text-ink-muted">{order.customer.phone}</p>
              <div className="mt-3 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-soft">
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.area}, {order.shippingAddress.district} {order.shippingAddress.postcode}
              </div>
              {order.shippingAddress.note ? (
                <p className="mt-3 rounded bg-cream-200/60 p-2 text-[11.5px] text-ink-soft">Note: {order.shippingAddress.note}</p>
              ) : null}
            </Panel>

            <Panel title="Payment">
              <p className="text-[13px] text-ink">{paymentLabel ?? PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
              <p className="mt-1 text-[12px] text-ink-muted">Status: {order.paymentStatus.replace(/_/g, " ")}</p>
              {order.paymentRef?.transactionId ? (
                <div className="mt-3 space-y-1 rounded-md bg-cream-200/60 p-2.5 text-[11.5px]">
                  <p>Transaction: <strong className="font-medium">{order.paymentRef.transactionId}</strong></p>
                  <p>Sender: {order.paymentRef.senderNumber ?? "—"}</p>
                </div>
              ) : null}
              <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
                Verify the transaction with the provider before marking this order paid.
              </p>
            </Panel>
          </div>

          <Panel title="Timeline">
            <ol className="space-y-2.5">
              {order.statusHistory.map((entry, index) => (
                <li key={index} className="flex justify-between gap-4 text-[12px]">
                  <span className="text-ink-soft">
                    <span className="font-medium text-ink">{ORDER_STATUS_LABELS[entry.status] ?? entry.status}</span>
                    {entry.note ? ` — ${entry.note}` : ""}
                    {entry.by ? <span className="text-ink-muted"> ({entry.by})</span> : null}
                  </span>
                  <span className="shrink-0 text-ink-muted">{formatDateTime(entry.at)}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Customer email">
            <p className="text-[12px] leading-relaxed text-ink-muted">
              {mail.configured
                ? `Order emails are on, sent from ${mail.from}.`
                : "Email is not configured yet — add RESEND_API_KEY and EMAIL_FROM to .env.local to send confirmations."}
            </p>
            <div className="mt-3">
              <ResendEmailButton orderId={String(order._id)} email={order.customer.email} />
            </div>
          </Panel>

          <Panel title="Actions">
            <OrderControls
              orderId={String(order._id)}
              status={order.status}
              paymentStatus={order.paymentStatus}
              note={order.customerNote ?? ""}
            />
          </Panel>
          <Panel title="Shipping snapshot">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              {order.shippingAddress.district === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"} · {formatMoney(order.deliveryCharge)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              {order.inventoryApplied ? "Stock reserved against this order." : "Stock has been released."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
