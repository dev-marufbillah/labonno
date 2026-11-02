"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { savePage, saveFaq } from "@/lib/actions/content";
import { slugify } from "@/lib/utils/format";
import type { FaqDoc, PageDoc } from "@/lib/db/types";

export function PageDialog({ page }: { page?: PageDoc }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    excerpt: page?.excerpt ?? "",
    content: page?.content ?? "",
    published: page?.published ?? true,
    showInFooter: page?.showInFooter ?? false,
  });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await savePage(form, page ? String(page._id) : undefined);
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
          {page ? "Edit" : <><Plus className="size-3" /> New page</>}
        </button>
      </DialogTrigger>
      <DialogContent title={page ? "Edit page" : "New content page"} description="Basic HTML is supported: headings, paragraphs, lists and tables." className="max-w-2xl">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: page ? form.slug : slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} hint-url />
            </div>
          </div>
          <div>
            <Label>Excerpt</Label>
            <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <Label>Content (HTML)</Label>
            <Textarea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono text-[12px]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Published</Label>
              <Select value={form.published ? "yes" : "no"} onChange={(e) => setForm({ ...form, published: e.target.value === "yes" })}>
                <option value="yes">Live</option>
                <option value="no">Draft</option>
              </Select>
            </div>
            <div>
              <Label>Show in footer</Label>
              <Select value={form.showInFooter ? "yes" : "no"} onChange={(e) => setForm({ ...form, showInFooter: e.target.value === "yes" })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </div>
          </div>
          <button type="button" onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60">
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save page"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FaqDialog({ faq }: { faq?: FaqDoc }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "Orders",
    order: faq?.order ?? 0,
    visible: faq?.visible ?? true,
  });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveFaq(form, faq ? String(faq._id) : undefined);
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
        <button className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[10px] uppercase tracking-wide2 hover:border-ink">
          {faq ? "Edit" : <><Plus className="size-3" /> Add FAQ</>}
        </button>
      </DialogTrigger>
      <DialogContent title={faq ? "Edit FAQ" : "New FAQ"} className="max-w-lg">
        <div className="space-y-3">
          <div>
            <Label>Question</Label>
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </div>
          <div>
            <Label>Answer</Label>
            <Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
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
          </div>
          <button type="button" onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60">
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save FAQ"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
