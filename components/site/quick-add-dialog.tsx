"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format";
import { useCommerce } from "./commerce-provider";
import type { ProductCardData } from "@/lib/utils/product-card";

export function QuickAddDialog({
  product,
  open,
  onOpenChange,
}: {
  product: ProductCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { addToCart, signedIn } = useCommerce();
  const colors = product.colors?.length ? product.colors : [{ name: "Natural", hex: "#D8C9B4" }];
  const sizes = product.sizes?.length ? product.sizes : ["One size"];
  const [size, setSize] = React.useState<string>(sizes[0]);
  const [color, setColor] = React.useState<string>(colors[0].name);

  const stockFor = (s: string, c: string) =>
    product.variants?.find((v) => v.size === s && v.color === c)?.stock ?? product.stock ?? 0;

  const stock = stockFor(size, color);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Add to bag" description={product.name} className="max-w-md">
        <div className="flex gap-4">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-cream-200">
            <Image src={product.images[0]} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg leading-tight">{product.name}</p>
            <p className="text-[13px] text-ink-muted">{formatMoney(product.salePrice ?? product.price)}</p>
            <p className="text-[11px] uppercase tracking-wide2 text-ink-muted">
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="label mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const available = colors.some((c) => stockFor(s, c.name) > 0);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={!available}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-11 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wide2 transition",
                      size === s ? "border-ink bg-ink text-cream" : "border-line text-ink-soft hover:border-ink",
                      !available && "cursor-not-allowed opacity-40 line-through"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="label mb-2">Colour · {color}</p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  className={cn(
                    "size-7 rounded-full border-2 transition",
                    color === c.name ? "border-ink" : "border-transparent hover:border-line"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            className="flex-1"
            disabled={stock <= 0}
            onClick={() => {
              addToCart({
                productId: String(product._id),
                name: product.name,
                slug: product.slug,
                image: product.images[0],
                sku:
                  product.variants?.find((v) => v.size === size && v.color === color)?.sku ??
                  product.sku ??
                  "",
                price: product.salePrice ?? product.price,
                size,
                color,
                quantity: 1,
                maxStock: stock,
              });
              if (signedIn) onOpenChange(false);
            }}
          >
            {signedIn ? "Add to bag" : "Sign in to add"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              router.push(`/products/${product.slug}`);
            }}
          >
            Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
