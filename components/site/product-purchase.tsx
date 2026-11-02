"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import type { ProductCardData } from "@/lib/utils/product-card";
import { useCommerce } from "./commerce-provider";
import { cn } from "@/lib/utils/cn";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/utils/format";

export function ProductPurchase({ product }: { product: ProductCardData }) {
  const router = useRouter();
  const { addToCart, isWishlisted, toggleWishlist } = useCommerce();
  const colors = product.colors?.length ? product.colors : [{ name: "Natural", hex: "#D8C9B4" }];
  const sizes = product.sizes?.length ? product.sizes : ["One size"];
  const [color, setColor] = React.useState(colors[0].name);
  const [size, setSize] = React.useState(sizes[0]);
  const [quantity, setQuantity] = React.useState(1);

  const stockFor = (s: string, c: string) =>
    product.variants?.find((v) => v.size === s && v.color === c)?.stock ?? product.stock ?? 0;

  const stock = stockFor(size, color);
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const wished = isWishlisted(String(product._id));

  const onAdd = (buyNow = false) => {
    addToCart({
      productId: String(product._id),
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      sku: product.variants?.find((v) => v.size === size && v.color === color)?.sku ?? product.sku ?? "",
      price,
      size,
      color,
      quantity,
      maxStock: stock,
    });
    if (buyNow) router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl">{formatMoney(price)}</span>
          {off ? (
            <>
              <span className="text-[13px] text-ink-muted line-through">{formatMoney(product.price)}</span>
              <span className="text-[10px] uppercase tracking-wide2 text-gold-dark">Save {off}%</span>
            </>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-wide2 text-ink-muted">
          {stock > 0 ? (stock <= 5 ? `Only ${stock} left` : "In stock") : "Out of stock"} · SKU{" "}
          {product.variants?.find((v) => v.size === size && v.color === color)?.sku ?? product.sku}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="label">Colour · <span className="text-ink">{color}</span></p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => setColor(option.name)}
              aria-label={option.name}
              aria-pressed={color === option.name}
              className={cn(
                "size-8 rounded-full border-2 p-0.5 transition",
                color === option.name ? "border-ink" : "border-transparent hover:border-line"
              )}
            >
              <span className="block size-full rounded-full border border-black/5" style={{ backgroundColor: option.hex }} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="label">Size</p>
          <Link href="/size-guide" className="text-[10.5px] uppercase tracking-wide2 text-gold-dark underline underline-offset-4">
            Size guide
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((option) => {
            const available = colors.some((c) => stockFor(option, c.name) > 0);
            return (
              <button
                key={option}
                type="button"
                disabled={!available}
                onClick={() => setSize(option)}
                aria-pressed={size === option}
                className={cn(
                  "min-w-12 rounded-full border px-4 py-2 text-[11px] uppercase tracking-wide2 transition",
                  size === option ? "border-ink bg-ink text-cream" : "border-line text-ink-soft hover:border-ink",
                  !available && "cursor-not-allowed opacity-40 line-through"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center text-ink-muted transition hover:text-ink"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-[13px]">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            className="grid size-11 place-items-center text-ink-muted transition hover:text-ink"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAdd(false)}
          disabled={stock <= 0}
          className="flex-1 rounded-full bg-ink px-6 py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stock > 0 ? "Add to bag" : "Sold out"}
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(String(product._id), product.name)}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line transition hover:border-ink"
        >
          <Heart className={cn("size-4", wished ? "fill-ink text-ink" : "text-ink-soft")} strokeWidth={1.5} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onAdd(true)}
        disabled={stock <= 0}
        className="w-full rounded-full border border-ink/25 px-6 py-3 text-[10px] uppercase tracking-label text-ink transition hover:bg-ink hover:text-cream disabled:opacity-40"
      >
        Buy it now
      </button>

      <ul className="grid gap-3 border-t border-line pt-5 text-[11.5px] text-ink-muted sm:grid-cols-3">
        <li className="flex items-start gap-2">
          <Truck className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.4} /> Delivery in 2–5 days
        </li>
        <li className="flex items-start gap-2">
          <RotateCcw className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.4} /> 7-day returns
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.4} /> Verified payments
        </li>
      </ul>
    </div>
  );
}
