"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveBanner } from "@/lib/actions/content";
import { ImageField } from "./image-field";
import type { BannerDoc } from "@/lib/db/types";

export function BannerDialog({ banner }: { banner?: BannerDoc }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({
    placement: banner?.placement ?? "home_hero",
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    eyebrow: banner?.eyebrow ?? "",
    image: banner?.image ?? "",
    mobileImage: banner?.mobileImage ?? "",
    ctaLabel: banner?.ctaLabel ?? "Shop the look",
    ctaHref: banner?.ctaHref ?? "/shop",
    align: banner?.align ?? "left",
    order: banner?.order ?? 1,
    visible: banner?.visible ?? true,
  });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveBanner(form, banner ? String(banner._id) : undefined);
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
          {banner ? "Edit" : <><Plus className="size-3" /> New banner</>}
        </button>
      </DialogTrigger>
      <DialogContent title={banner ? "Edit banner" : "New banner"} description="Hero slides support desktop and mobile images." className="max-w-xl">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Placement</Label>
              <Select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as BannerDoc["placement"] })}>
                <option value="home_hero">Homepage hero slide</option>
                <option value="promo">Promotional strip</option>
                <option value="category">Category banner</option>
                <option value="popup">Popup</option>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Eyebrow</Label>
              <Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="New arrivals" />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Script subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="with Labonno" />
            </div>
            <div>
              <Label>Text alignment</Label>
              <Select value={form.align} onChange={(e) => setForm({ ...form, align: e.target.value as BannerDoc["align"] })}>
                <option value="left">Left</option>
                <option value="center">Centre</option>
                <option value="right">Right</option>
              </Select>
            </div>
            <div>
              <Label>Button label</Label>
              <Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            </div>
            <div>
              <Label>Button link</Label>
              <Input value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
            </div>
          </div>
          <ImageField label="Desktop image" value={form.image} onChange={(value) => setForm({ ...form, image: value[0] ?? "" })} folder="banners" hint="Recommended 1600×900 or larger" />
          <ImageField label="Mobile image (optional)" value={form.mobileImage} onChange={(value) => setForm({ ...form, mobileImage: value[0] ?? "" })} folder="banners" />
          <div>
            <Label>Visibility</Label>
            <Select value={form.visible ? "yes" : "no"} onChange={(e) => setForm({ ...form, visible: e.target.value === "yes" })}>
              <option value="yes">Visible</option>
              <option value="no">Hidden</option>
            </Select>
          </div>
          <button type="button" onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60">
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save banner"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
