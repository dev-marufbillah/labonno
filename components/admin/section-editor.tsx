"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { saveSection } from "@/lib/actions/content";
import { ImageField } from "./image-field";
import type { HomepageSectionDoc } from "@/lib/db/types";

export function SectionEditor({
  section,
  collections,
}: {
  section: HomepageSectionDoc;
  collections: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const data = (section.data ?? {}) as Record<string, unknown>;
  const [title, setTitle] = React.useState(section.title);
  const [subtitle, setSubtitle] = React.useState(section.subtitle ?? "");
  const [visible, setVisible] = React.useState(section.visible);
  const [order, setOrder] = React.useState(section.order);
  const [image, setImage] = React.useState(typeof data.image === "string" ? data.image : "");
  const [headline, setHeadline] = React.useState(typeof data.headline === "string" ? data.headline : "");
  const [collectionSlug, setCollectionSlug] = React.useState(typeof data.collectionSlug === "string" ? data.collectionSlug : "");
  const [source, setSource] = React.useState(typeof data.source === "string" ? data.source : "bestSellers");
  const [limit, setLimit] = React.useState(typeof data.limit === "number" ? data.limit : 4);
  const [body, setBody] = React.useState(typeof data.body === "string" ? data.body : "");
  const [ctaLabel, setCtaLabel] = React.useState(typeof data.ctaLabel === "string" ? data.ctaLabel : "");
  const [ctaHref, setCtaHref] = React.useState(typeof data.ctaHref === "string" ? data.ctaHref : "");

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveSection(
        {
          title,
          subtitle,
          visible,
          order,
          data: {
            ...data,
            ...(image ? { image } : {}),
            ...(headline ? { headline } : {}),
            ...(collectionSlug ? { collectionSlug } : {}),
            source,
            limit,
            ...(body ? { body } : {}),
            ctaLabel,
            ctaHref,
          },
        },
        section.key
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
        <button className="rounded-full border border-line px-3 py-2 text-[10px] uppercase tracking-wide2 hover:border-ink">Edit</button>
      </DialogTrigger>
      <DialogContent title={section.label} description={`Section type: ${section.type.replace(/_/g, " ")}`} className="max-w-xl">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div>
              <Label>Order</Label>
              <Input type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} />
            </div>
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
          </div>

          {section.type === "featured_collection" ? (
            <>
              <div>
                <Label>Headline</Label>
                <Input value={headline} onChange={(event) => setHeadline(event.target.value)} />
              </div>
              <div>
                <Label>Collection</Label>
                <Select value={collectionSlug} onChange={(event) => setCollectionSlug(event.target.value)}>
                  <option value="">Select a collection</option>
                  {collections.map((collection) => (
                    <option key={collection.slug} value={collection.slug}>{collection.name}</option>
                  ))}
                </Select>
              </div>
              <ImageField label="Banner image" value={image} onChange={(value) => setImage(value[0] ?? "")} folder="homepage" />
            </>
          ) : null}

          {section.type === "product_grid" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Product source</Label>
                <Select value={source} onChange={(event) => setSource(event.target.value)}>
                  <option value="bestSellers">Best sellers</option>
                  <option value="newArrivals">New arrivals</option>
                  <option value="featured">Featured products</option>
                </Select>
              </div>
              <div>
                <Label>Number of products</Label>
                <Input type="number" min={2} max={8} value={limit} onChange={(event) => setLimit(Number(event.target.value))} />
              </div>
            </div>
          ) : null}

          {section.type === "editorial" ? (
            <>
              <div>
                <Label>Body copy</Label>
                <Textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} />
              </div>
              <ImageField label="Editorial image" value={image} onChange={(value) => setImage(value[0] ?? "")} folder="homepage" />
            </>
          ) : null}

          {section.type === "hero" || section.type === "editorial" || section.type === "featured_collection" || section.type === "product_grid" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Button label</Label>
                <Input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} />
              </div>
              <div>
                <Label>Button link</Label>
                <Input value={ctaHref} onChange={(event) => setCtaHref(event.target.value)} placeholder="/collections/..." />
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-md bg-cream-200/50 px-3 py-2">
            <span className="text-[11.5px] text-ink-soft">Visible on homepage</span>
            <Switch checked={visible} onCheckedChange={setVisible} />
          </div>

          <button type="button" onClick={submit} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream disabled:opacity-60">
            {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save section"}
          </button>
          {section.type === "hero" ? (
            <p className="text-[10.5px] leading-relaxed text-ink-muted">
              Hero slides are managed under Banners → Home hero. The title and button here are fallbacks only.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
