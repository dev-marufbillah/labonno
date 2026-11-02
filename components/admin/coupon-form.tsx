"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveCoupon } from "@/lib/actions/marketing";
import type { CouponDoc } from "@/lib/db/types";

export function CouponDialog({ coupon }: { coupon?: CouponDoc }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? "percentage",
    value: coupon?.value ?? 10,
    minSubtotal: coupon?.minSubtotal ?? 0,
    maxDiscount: coupon?.maxDiscount ?? 0,
    usageLimit: coupon?.usageLimit ?? 0,
    perUserLimit: coupon?.perUserLimit ?? 1,
    startDate: coupon?.startDate ? new Date(coupon.startDate).toISOString().slice(0, 10) : "",
    endDate: coupon?.endDate ? new Date(coupon.endDate).toISOString().slice(0, 10) : "",
    active: coupon?.active ?? true,
  });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveCoupon(
        {
          ...form,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null,
        },
        coupon ? String(coupon._id) : undefined
      );
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-label text-cream hover:bg-ink-soft">
          {coupon ? "Edit" : <><Plus className="size-3" /> New coupon</>}
        </button>
      </DialogTrigger>
      <DialogContent title={coupon ? "Edit coupon" : "New coupon"} description="Discounts are validated server-side at checkout." className="max-w-xl">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount (৳)</option>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Minimum subtotal (৳)</Label>
              <Input type="number" value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Max discount (৳, optional)</Label>
              <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Usage limit (0 = unlimited)</Label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Starts</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <Label>Ends</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="10% off your first order" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.active ? "yes" : "no"} onChange={(e) => setForm({ ...form, active: e.target.value === "yes" })}>
              <option value="yes">Active</option>
              <option value="no">Paused</option>
            </Select>
          </div>
          <button type="button" onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60">
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save coupon"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
