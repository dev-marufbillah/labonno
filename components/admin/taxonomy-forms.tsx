"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { ImageField } from "./image-field";
import { saveCategory, saveCollection } from "@/lib/actions/catalog";
import { slugify } from "@/lib/utils/format";
import type { CategoryDoc, CollectionDoc } from "@/lib/db/types";

function useSaver() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  return { router, busy, setBusy, open, setOpen };
}

export function CategoryDialog({ category }: { category?: CategoryDoc }) {
  const { router, busy, setBusy, open, setOpen } = useSaver();
  const [form, setForm] = React.useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    tagline: category?.tagline ?? "",
    description: category?.description ?? "",
    image: category?.image ?? "",
    order: category?.order ?? 0,
    visible: category?.visible ?? true,
    showOnHome: category?.showOnHome ?? true,
  });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveCategory(form, category ? String(category._id) : undefined);
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
          {category ? "Edit" : <><Plus className="size-3" /> Add category</>}
        </button>
      </DialogTrigger>
      <DialogContent title={category ? "Edit category" : "New category"} description="Categories organise the shop and power the homepage arches." className="max-w-xl">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: category ? form.slug : slugify(e.target.value) })}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Quiet luxury" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <ImageField label="Category image" value={form.image} onChange={(value) => setForm({ ...form, image: value[0] ?? "" })} folder="categories" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Visible</Label>
              <Select value={form.visible ? "yes" : "no"} onChange={(e) => setForm({ ...form, visible: e.target.value === "yes" })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
            <div>
              <Label>On homepage</Label>
              <Select value={form.showOnHome ? "yes" : "no"} onChange={(e) => setForm({ ...form, showOnHome: e.target.value === "yes" })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60"
          >
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save category"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CollectionDialog({ collection }: { collection?: CollectionDoc }) {
  const { router, busy, setBusy, open, setOpen } = useSaver();
  const [form, setForm] = React.useState({
    name: collection?.name ?? "",
    slug: collection?.slug ?? "",
    tagline: collection?.tagline ?? "",
    description: collection?.description ?? "",
    image: collection?.image ?? "",
    order: collection?.order ?? 0,
    visible: collection?.visible ?? true,
    featured: collection?.featured ?? false,
  });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveCollection(form, collection ? String(collection._id) : undefined);
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
          {collection ? "Edit" : <><Plus className="size-3" /> Add collection</>}
        </button>
      </DialogTrigger>
      <DialogContent title={collection ? "Edit collection" : "New collection"} description="Collections group products into editorial edits." className="max-w-xl">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: collection ? form.slug : slugify(e.target.value) })}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <ImageField label="Collection image" value={form.image} onChange={(value) => setForm({ ...form, image: value[0] ?? "" })} folder="collections" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Visible</Label>
              <Select value={form.visible ? "yes" : "no"} onChange={(e) => setForm({ ...form, visible: e.target.value === "yes" })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
            <div>
              <Label>Featured</Label>
              <Select value={form.featured ? "yes" : "no"} onChange={(e) => setForm({ ...form, featured: e.target.value === "yes" })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60"
          >
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save collection"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
