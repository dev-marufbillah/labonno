"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setOrderStatus, setPaymentStatus, saveOrderNote } from "@/lib/actions/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/db/types";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/config/site";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

const NEXT_STATUSES: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function OrderControls({
  orderId,
  status,
  paymentStatus,
  note,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  note: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [nextStatus, setNextStatus] = React.useState<OrderStatus | "">(NEXT_STATUSES[status]?.[0] ?? "");
  const [statusNote, setStatusNote] = React.useState("");
  const [customerNote, setCustomerNote] = React.useState(note);

  const run = async (key: string, fn: () => Promise<{ ok: boolean; message: string }>) => {
    setBusy(key);
    try {
      const result = await fn();
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Update order status</Label>
        <div className="flex gap-2">
          <Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as OrderStatus)} disabled={!NEXT_STATUSES[status]?.length}>
            {NEXT_STATUSES[status]?.length ? (
              NEXT_STATUSES[status].map((option) => (
                <option key={option} value={option}>{ORDER_STATUS_LABELS[option]}</option>
              ))
            ) : (
              <option value="">No further transitions</option>
            )}
          </Select>
          <button
            type="button"
            disabled={!nextStatus || busy === "status"}
            onClick={() => nextStatus && run("status", () => setOrderStatus(orderId, nextStatus, statusNote))}
            className="h-11 shrink-0 rounded-md bg-ink px-4 text-[10px] uppercase tracking-label text-cream disabled:opacity-50"
          >
            {busy === "status" ? <Loader2 className="size-3 animate-spin" /> : "Apply"}
          </button>
        </div>
        <Input
          className="mt-2 h-9 text-[12px]"
          placeholder="Optional note for the timeline"
          value={statusNote}
          onChange={(event) => setStatusNote(event.target.value)}
        />
      </div>

      <div>
        <Label>Payment verification</Label>
        <div className="flex flex-wrap gap-2">
          {(["paid", "pending_verification", "unpaid", "refunded", "failed"] as PaymentStatus[]).map((option) => (
            <button
              key={option}
              type="button"
              disabled={option === paymentStatus || busy === `pay-${option}`}
              onClick={() => run(`pay-${option}`, () => setPaymentStatus(orderId, option))}
              className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wide2 transition ${
                option === paymentStatus ? "border-emerald-700 bg-emerald-700/10 text-emerald-800" : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {busy === `pay-${option}` ? "…" : PAYMENT_STATUS_LABELS[option]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-ink-muted">
          Only mark an order paid after verifying the bKash/Nagad transaction ID in the provider app, or after SSLCommerz
          validation returns VALID.
        </p>
      </div>

      <div>
        <Label>Internal note</Label>
        <Textarea rows={3} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} />
        <button
          type="button"
          onClick={() => run("note", () => saveOrderNote(orderId, customerNote))}
          disabled={busy === "note"}
          className="mt-2 rounded-full border border-line px-4 py-2 text-[10px] uppercase tracking-wide2 hover:border-ink"
        >
          {busy === "note" ? "Saving" : "Save note"}
        </button>
      </div>
    </div>
  );
}
