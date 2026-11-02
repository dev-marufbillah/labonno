"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { useCommerce } from "./commerce-provider";
import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/lib/utils/product-card";
import { EmptyState } from "./empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

export function WishlistView({ initialProducts }: { initialProducts: ProductCardData[] }) {
  const { wishlist, wishlistReady } = useCommerce();
  const [products, setProducts] = React.useState<ProductCardData[]>(initialProducts);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!wishlistReady) return;
    const missing = wishlist.filter((id) => !initialProducts.some((product) => String(product._id) === id));
    if (missing.length === 0) {
      setProducts(initialProducts.filter((product) => wishlist.includes(String(product._id))));
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products?ids=${missing.join(",")}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data: { products: ProductCardData[] }) => {
        if (cancelled) return;
        const merged = [...initialProducts, ...(data.products ?? [])];
        setProducts(merged.filter((product) => wishlist.includes(String(product._id))));
      })
      .catch(() => setProducts(initialProducts))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [wishlist, wishlistReady, initialProducts]);

  if (!wishlistReady || (loading && products.length === 0)) {
    return (
      <div className="shell grid grid-cols-2 gap-4 py-10 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="shell py-10">
        <EmptyState
          icon={<Heart className="size-6" strokeWidth={1.2} />}
          title="Your wishlist is waiting"
          description="Tap the heart on any piece to keep it here. Saved pieces stay on this device, and sync to your account when you sign in."
          actionLabel="Discover pieces"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="shell py-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={String(product._id)} product={product} />
        ))}
      </div>
    </div>
  );
}
