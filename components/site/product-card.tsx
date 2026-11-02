"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useCommerce } from "./commerce-provider";
import { QuickAddDialog } from "./quick-add-dialog";
import { type ProductCardData } from "@/lib/utils/product-card";

export { toCardData } from "@/lib/utils/product-card";
export type { ProductCardData } from "@/lib/utils/product-card";

export function ProductCard({
  product,
  priority = false,
  variant = "default",
}: {
  product: ProductCardData;
  priority?: boolean;
  variant?: "default" | "compact";
}) {
  const { isWishlisted, toggleWishlist } = useCommerce();
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const soldOut = (product.stock ?? 1) <= 0 || (product.variants?.every((v) => v.stock <= 0) ?? false);
  const id = String(product._id);
  const wished = isWishlisted(id);

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-lg bg-cream-200/60">
        <Link href={`/products/${product.slug}`} aria-label={product.name} className="block">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src={product.images[0] ?? "/images/product-1.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.035]"
            />
            {product.images[1] ? (
              <Image
                src={product.images[1]}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            ) : null}
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-1">
            {off ? (
              <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[9px] uppercase tracking-wide2 text-cream">
                -{off}%
              </span>
            ) : null}
            {product.newArrival && !off ? (
              <span className="rounded-full bg-cream/90 px-2 py-0.5 text-[9px] uppercase tracking-wide2 text-ink">
                New
              </span>
            ) : null}
            {soldOut ? (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] uppercase tracking-wide2 text-ink-muted">
                Sold out
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(id, product.name)}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wished}
            className="pointer-events-auto grid size-8 place-items-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
          >
            <Heart className={cn("size-3.5", wished ? "fill-ink text-ink" : "text-ink-soft")} strokeWidth={1.5} />
          </button>
        </div>

        {!soldOut && (
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            aria-label={`Quick add ${product.name}`}
            className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition duration-300 hover:bg-ink hover:text-cream"
          >
            <ShoppingBag className="size-3.5" strokeWidth={1.6} />
          </button>
        )}
      </div>

      <Link href={`/products/${product.slug}`} className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-serif text-[15px] text-ink">{formatMoney(price)}</span>
        <span className="truncate text-[10px] uppercase tracking-wide2 text-ink-muted">
          {variant === "compact" ? product.name : product.name}
        </span>
      </Link>

      <QuickAddDialog product={product} open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
