import type { Metadata } from "next";
import Link from "next/link";
import { getOrderForTracking } from "@/lib/services/orders";
import { formatMoney, formatDateTime } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/config/site";
import { PageHeader } from "@/components/site/page-header";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track order",
  description: "Track your LABONNO order with your order number and mobile number.",
  alternates: { canonical: "/track-order" },
};

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; phone?: string; error?: string }>;
}) {
  const { order: orderNumber, phone, error } = await searchParams;
  const order = orderNumber && phone ? await getOrderForTracking(orderNumber, phone) : null;
  const lookedUp = Boolean(orderNumber && phone);
  const currentStep = order ? STEPS.indexOf(order.status) : -1;

  return (
    <>
      <PageHeader
        eyebrow="Client care"
        title="Track order"
        description="Enter the order number from your confirmation email and the mobile number used at checkout."
        breadcrumbs={[{ label: "Track order" }]}
      />
      <div className="shell max-w-3xl py-12">
        <form method="GET" className="rounded-xl border border-line bg-cream-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="order">Order number</Label>
              <Input id="order" name="order" defaultValue={orderNumber ?? ""} placeholder="LBN-261102-4821" required />
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" name="phone" defaultValue={phone ?? ""} placeholder="01712345678" inputMode="tel" required />
            </div>
          </div>
          <button type="submit" className="mt-5 rounded-full bg-ink px-7 py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft">
            Track order
          </button>
          {error ? <p className="mt-3 text-[12px] text-red-700">{error}</p> : null}
        </form>

        {lookedUp && !order ? (
          <div className="mt-6 rounded-lg border border-dashed border-line p-6 text-center">
            <p className="font-serif text-xl">No order found</p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Check the order number and mobile number, or contact our studio and we will look it up for you.
            </p>
            <Link href="/contact" className="mt-4 inline-block text-[10.5px] uppercase tracking-label text-gold-dark underline underline-offset-4">
              Contact the studio
            </Link>
          </div>
        ) : null}

        {order ? (
          <div className="mt-6 rounded-xl border border-line bg-cream-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Order</p>
                <p className="font-serif text-xl">{order.orderNumber}</p>
                <p className="mt-1 text-[12px] text-ink-muted">{order.items.length} item(s) · {formatMoney(order.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Status</p>
                <p className="font-serif text-lg capitalize">{ORDER_STATUS_LABELS[order.status]}</p>
                <p className="text-[11px] text-ink-muted">Payment: {PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
              </div>
            </div>

            {order.status !== "cancelled" && order.status !== "returned" ? (
              <ol className="mt-7 flex items-start justify-between gap-1">
                {STEPS.map((step, index) => (
                  <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                    <span className={`grid size-7 place-items-center rounded-full border text-[10px] ${currentStep >= index ? "border-ink bg-ink text-cream" : "border-line text-ink-muted"}`}>
                      {index + 1}
                    </span>
                    <span className={`text-[9px] uppercase tracking-wide2 ${currentStep >= index ? "text-ink" : "text-ink-muted"}`}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-[12.5px] text-red-800">
                This order was {order.status}. Contact the studio if you need help with it.
              </p>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">History</p>
              <ul className="mt-2 space-y-1.5">
                {order.statusHistory.map((entry, index) => (
                  <li key={index} className="flex justify-between gap-4 text-[12px] text-ink-soft">
                    <span className="capitalize">{ORDER_STATUS_LABELS[entry.status] ?? entry.status}{entry.note ? ` — ${entry.note}` : ""}</span>
                    <span className="shrink-0 text-ink-muted">{formatDateTime(entry.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 border-t border-line pt-4 text-[12.5px] text-ink-soft">
              <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">Delivering to</p>
              <p className="mt-1">
                {order.shippingAddress.address}, {order.shippingAddress.area}, {order.shippingAddress.district}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
