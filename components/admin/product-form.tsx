"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/lib/actions/catalog";
import { slugify } from "@/lib/utils/format";
import { ImageField } from "./image-field";
import { Field, Panel } from "./ui";
import { Input, Select, Textarea, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ProductDoc } from "@/lib/db/types";

interface VariantRow {
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export function ProductForm({
  product,
  categories,
  collections,
}: {
  product?: ProductDoc | null;
  categories: { slug: string; name: string }[];
  collections: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [name, setName] = React.useState(product?.name ?? "");
  const [slug, setSlug] = React.useState(product?.slug ?? "");
  const [sku, setSku] = React.useState(product?.sku ?? "");
  const [shortDescription, setShortDescription] = React.useState(product?.shortDescription ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [category, setCategory] = React.useState(product?.category ?? categories[0]?.slug ?? "");
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>(product?.collections ?? []);
  const [images, setImages] = React.useState<string[]>(product?.images ?? []);
  const [price, setPrice] = React.useState(String(product?.price ?? ""));
  const [salePrice, setSalePrice] = React.useState(product?.salePrice ? String(product.salePrice) : "");
  const [sizesText, setSizesText] = React.useState((product?.sizes ?? ["S", "M", "L"]).join(", "));
  const [colors, setColors] = React.useState(
    product?.colors?.length ? product.colors : [{ name: "Ivory", hex: "#F1E8DB" }]
  );
  const [variants, setVariants] = React.useState<VariantRow[]>(
    product?.variants?.map((v) => ({ sku: v.sku, size: v.size, color: v.color, stock: v.stock })) ?? []
  );
  const [material, setMaterial] = React.useState(product?.material ?? "");
  const [care, setCare] = React.useState(product?.careInstructions ?? "");
  const [tags, setTags] = React.useState((product?.tags ?? []).join(", "));
  const [featured, setFeatured] = React.useState(product?.featured ?? false);
  const [newArrival, setNewArrival] = React.useState(product?.newArrival ?? false);
  const [bestSeller, setBestSeller] = React.useState(product?.bestSeller ?? false);
  const [status, setStatus] = React.useState<ProductDoc["status"]>(product?.status ?? "draft");
  const [seoTitle, setSeoTitle] = React.useState(product?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = React.useState(product?.seo?.description ?? "");

  const sizes = React.useMemo(
    () => sizesText.split(",").map((size) => size.trim()).filter(Boolean),
    [sizesText]
  );

  // Keep the variant matrix in step with the chosen sizes and colours.
  React.useEffect(() => {
    setVariants((current) => {
      const next: VariantRow[] = [];
      for (const color of colors) {
        for (const size of sizes) {
          const existing = current.find((row) => row.size === size && row.color === color.name);
          next.push({
            sku:
              existing?.sku ||
              `${sku || "LBN"}-${color.name.slice(0, 3).toUpperCase()}-${size}`.replace(/\s+/g, ""),
            size,
            color: color.name,
            stock: existing?.stock ?? 0,
          });
        }
      }
      return next;
    });
  }, [colors, sizes, sku]);

  const totalStock = variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        sku: sku || `LBN-${slugify(name).slice(0, 6).toUpperCase()}`,
        shortDescription,
        description,
        category,
        collections: selectedCollections,
        images,
        price: Number(price) || 0,
        salePrice: salePrice ? Number(salePrice) : null,
        sizes,
        colors,
        variants,
        stock: totalStock,
        material,
        careInstructions: care,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        featured,
        newArrival,
        bestSeller,
        status,
        seo: { title: seoTitle, description: seoDescription, keywords: [] },
      };
      const result = await saveProduct(payload, product ? String(product._id) : undefined);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Could not save the product");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <Panel title="Product details">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" error={errors.name}>
                <Input value={name} onChange={(e) => { setName(e.target.value); if (!product) setSlug(slugify(e.target.value)); }} placeholder="Zohra Emerald Lehenga" />
              </Field>
              <Field label="Slug" error={errors.slug} hint="Used in the product URL">
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="zohra-emerald-lehenga" />
              </Field>
              <Field label="SKU" error={errors.sku}>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="LBN-ZO-EM" />
              </Field>
              <Field label="Category" error={errors.category}>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((option) => (
                    <option key={option.slug} value={option.slug}>{option.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Short description" error={errors.shortDescription} hint="One line shown under the title and in search results">
              <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </Field>
            <Field label="Full description" error={errors.description}>
              <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Material">
                <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Pure silk with zardozi" />
              </Field>
              <Field label="Care instructions">
                <Input value={care} onChange={(e) => setCare(e.target.value)} placeholder="Dry clean only" />
              </Field>
            </div>
            <Field label="Tags" hint="Comma separated, used for search">
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bridal, lehenga, emerald" />
            </Field>
            <div>
              <Label>Collections</Label>
              <div className="flex flex-wrap gap-2">
                {collections.map((option) => {
                  const active = selectedCollections.includes(option.slug);
                  return (
                    <button
                      key={option.slug}
                      type="button"
                      onClick={() =>
                        setSelectedCollections((prev) =>
                          active ? prev.filter((slug) => slug !== option.slug) : [...prev, option.slug]
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-[10.5px] uppercase tracking-wide2 transition ${
                        active ? "border-ink bg-ink text-cream" : "border-line text-ink-soft hover:border-ink"
                      }`}
                    >
                      {option.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Media" description="First image is used as the card thumbnail">
          <ImageField label="Product images" value={images} onChange={setImages} multiple folder="products" hint="JPG, PNG or WEBP up to 8 MB. Uploads go to Cloudinary when configured." />
        </Panel>

        <Panel title="Pricing & variants">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Regular price (৳)" error={errors.price}>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Sale price (৳)" hint="Leave empty for no sale">
              <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
            </Field>
            <Field label="Sizes" hint="Comma separated">
              <Input value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="XS, S, M, L, XL" />
            </Field>
            <Field label="Total stock" hint="Calculated from the variant matrix">
              <Input value={totalStock} readOnly className="bg-cream-200/50" />
            </Field>
          </div>

          <div className="mt-4">
            <Label>Colours</Label>
            <div className="space-y-2">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(event) =>
                      setColors((prev) => prev.map((item, i) => (i === index ? { ...item, hex: event.target.value } : item)))
                    }
                    className="size-8 shrink-0 cursor-pointer rounded border border-line bg-transparent"
                    aria-label={`Colour ${index + 1}`}
                  />
                  <Input
                    value={color.name}
                    onChange={(event) =>
                      setColors((prev) => prev.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)))
                    }
                    placeholder="Colour name"
                  />
                  {colors.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setColors((prev) => prev.filter((_, i) => i !== index))}
                      className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-ink-muted hover:border-red-300 hover:text-red-700"
                      aria-label="Remove colour"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setColors((prev) => [...prev, { name: "", hex: "#D9C7A7" }])}
              className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide2 text-gold-dark"
            >
              <Plus className="size-3" /> Add colour
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[12px]">
              <thead className="border-b border-line text-[9.5px] uppercase tracking-wide2 text-ink-muted">
                <tr>
                  <th className="py-2 pr-2 font-medium">Size</th>
                  <th className="py-2 pr-2 font-medium">Colour</th>
                  <th className="py-2 pr-2 font-medium">SKU</th>
                  <th className="py-2 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((row, index) => (
                  <tr key={`${row.size}-${row.color}`} className="border-b border-line/60">
                    <td className="py-1.5 pr-2">{row.size}</td>
                    <td className="py-1.5 pr-2">{row.color}</td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={row.sku}
                        onChange={(event) =>
                          setVariants((prev) => prev.map((item, i) => (i === index ? { ...item, sku: event.target.value } : item)))
                        }
                        className="h-8 w-full rounded border border-line bg-white/70 px-2 text-[11px] outline-none focus:border-gold"
                      />
                    </td>
                    <td className="py-1.5">
                      <input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item, i) => (i === index ? { ...item, stock: Number(event.target.value) } : item))
                          )
                        }
                        className="h-8 w-20 rounded border border-line bg-white/70 px-2 text-[11px] outline-none focus:border-gold"
                      />
                    </td>
                  </tr>
                ))}
                {variants.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-ink-muted">Add sizes and colours to generate variants.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="SEO">
          <div className="space-y-3">
            <Field label="Meta title">
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Zohra Emerald Lehenga — LABONNO" />
            </Field>
            <Field label="Meta description">
              <Textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Publishing">
          <div className="space-y-3.5">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as ProductDoc["status"])}>
                <option value="draft">Draft — hidden</option>
                <option value="published">Published — live</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            {[
              { label: "Featured on homepage", value: featured, set: setFeatured },
              { label: "New arrival", value: newArrival, set: setNewArrival },
              { label: "Best seller", value: bestSeller, set: setBestSeller },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[12px] text-ink-soft">{row.label}</span>
                <Switch checked={row.value} onCheckedChange={row.set} />
              </div>
            ))}
            <div className="border-t border-line pt-3">
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft disabled:opacity-60"
              >
                {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : product ? "Save changes" : "Create product"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="mt-2 w-full rounded-full border border-line py-2.5 text-[10px] uppercase tracking-label text-ink-soft hover:border-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Checklist">
          <ul className="space-y-2 text-[11.5px] text-ink-muted">
            <li className={images.length ? "text-emerald-800" : ""}>• At least one image</li>
            <li className={shortDescription.length > 10 ? "text-emerald-800" : ""}>• A clear short description</li>
            <li className={Number(price) > 0 ? "text-emerald-800" : ""}>• Pricing set</li>
            <li className={variants.some((v) => v.stock > 0) ? "text-emerald-800" : ""}>• Stock available</li>
            <li className={status === "published" ? "text-emerald-800" : ""}>• Published to the storefront</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
