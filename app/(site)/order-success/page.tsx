import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";
import { getOrderByNumber } from "@/lib/services/orders";
import { getCurrentUser } from "@/lib/auth/server";
import { formatMoney, formatDate } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from "@/lib/config/site";
import { EmptyState } from "@/components/site/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const cookieStore = await cookies();
  const cookieOrder = cookieStore.get("labonno_last_order")?.value;
  const user = await getCurrentUser();

  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;
  const authorised = order && (order.orderNumber === cookieOrder || (user && order.userId === user.id));

  if (!order || !authorised) {
    return (
      <div className="shell py-16">
        <EmptyState
          title="We could not find that order"
          description="If you have just placed an order, check your email for the confirmation. You can also look it up with your order number and mobile number."
          actionLabel="Track an order"
          actionHref="/track-order"
        />
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-700/10 text-emerald-800">
          <CheckCircle2 className="size-7" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 display-2">Thank you, {order.customer.name.split(" ")[0]}</h1>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
          Your order <strong className="font-medium text-ink">{order.orderNumber}</strong> is with our studio. We will call{" "}
          {order.customer.phone} to confirm before dispatch.
        </p>
        {order.paymentMethod !== "cod" ? (
          <p className="mx-auto mt-3 max-w-md rounded-md bg-cream-200/70 px-4 py-2.5 text-[12px] text-ink-soft">
            {order.paymentMethod === "sslcommerz"
              ? "Card payment result will appear below once the gateway confirms it."
              : `Your ${PAYMENT_METHOD_LABELS[order.paymentMethod]} payment is pending verification. We will confirm it before dispatch.`}
          </p>
        ) : null}
      </div>

      <div className="mt-10 rounded-xl border border-line bg-cream-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Order</p>
            <p className="font-serif text-lg">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Placed</p>
            <p className="text-[13px]">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <ol className="mt-6 flex items-center justify-between gap-1">
          {STEPS.map((step, index) => {
            const reached = stepIndex >= index;
            return (
              <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
                <span className={`grid size-8 place-items-center rounded-full border ${reached ? "border-ink bg-ink text-cream" : "border-line text-ink-muted"}`}>
                  {index === 0 ? <Package className="size-3.5" /> : index === 3 ? <Truck className="size-3.5" /> : index === 4 ? <Home className="size-3.5" /> : <span className="text-[11px]">{index + 1}</span>}
                </span>
                <span className={`text-[9.5px] uppercase tracking-wide2 ${reached ? "text-ink" : "text-ink-muted"}`}>
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </li>
            );
          })}
        </ol>

        <ul className="mt-6 divide-y divide-line">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center justify-between gap-3 py-3">
              <div>
                <Link href={`/products/${item.slug}`} className="font-serif text-[15px] hover:text-gold-dark">
                  {item.name}
                </Link>
                <p className="text-[10.5px] uppercase tracking-wide2 text-ink-muted">
                  {item.size} · {item.color} · ×{item.quantity}
                </p>
              </div>
              <span className="text-[13px]">{formatMoney(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[13px]">
          <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-emerald-800"><dt>Discount {order.coupon ? `(${order.coupon.code})` : ""}</dt><dd>−{formatMoney(order.discount)}</dd></div>
          ) : null}
          <div className="flex justify-between"><dt className="text-ink-muted">Delivery</dt><dd>{order.deliveryCharge === 0 ? "Free" : formatMoney(order.deliveryCharge)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 font-serif text-lg"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">Payment</dt><dd>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd></div>
        </dl>

        <div className="mt-6 rounded-lg bg-cream-200/60 p-4 text-[12.5px] leading-relaxed text-ink-soft">
          <p className="font-medium text-ink">Delivering to</p>
          <p>
            {order.shippingAddress.address}, {order.shippingAddress.area}, {order.shippingAddress.district}
            {order.shippingAddress.postcode ? ` ${order.shippingAddress.postcode}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="rounded-full bg-ink px-7 py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft">
          Continue shopping
        </Link>
        <Link href={`/track-order?order=${order.orderNumber}`} className="rounded-full border border-ink/25 px-7 py-3 text-[10px] uppercase tracking-label text-ink transition hover:bg-ink hover:text-cream">
          Track this order
        </Link>
        {!user ? (
          <Link href="/register" className="rounded-full border border-ink/25 px-7 py-3 text-[10px] uppercase tracking-label text-ink transition hover:bg-ink hover:text-cream">
            Create an account
          </Link>
        ) : null}
      </div>
    </div>
  );
}
