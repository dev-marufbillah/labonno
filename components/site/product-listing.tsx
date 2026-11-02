import { Suspense } from "react";
import type { ProductDoc } from "@/lib/db/types";
import { ProductCard } from "@/components/site/product-card";
import { FilterToolbar, Pagination, type FilterOptions } from "@/components/site/filters";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { toCardData } from "@/lib/utils/product-card";

export function ProductGrid({
  products,
  columns = 4,
  basePath,
}: {
  products: ProductDoc[];
  columns?: 3 | 4;
  basePath?: string;
}) {
  if (!products.length) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-cream-100/50 px-6 text-center">
        <p className="font-serif text-2xl">No pieces match this edit</p>
        <p className="mt-2 max-w-sm text-[13px] text-ink-muted">
          Try removing a filter or exploring the full collection — new pieces arrive every Thursday.
        </p>
        <a
          href={basePath ?? "/shop"}
          className="mt-5 rounded-full border border-ink/25 px-6 py-2.5 text-[10px] uppercase tracking-label transition hover:bg-ink hover:text-cream"
        >
          View all pieces
        </a>
      </div>
    );
  }

  return (
    <div
      className={
        columns === 3
          ? "grid flex-1 grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3"
          : "grid flex-1 grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4"
      }
    >
      {products.map((product, index) => (
        <ProductCard key={String(product._id)} product={toCardData(product)} priority={index < 4} />
      ))}
    </div>
  );
}

export function ListingLayout({
  products,
  total,
  page,
  totalPages,
  options,
  basePath,
}: {
  products: ProductDoc[];
  total: number;
  page: number;
  totalPages: number;
  options: FilterOptions;
  basePath?: string;
}) {
  return (
    <div className="shell py-10">
      <div className="lg:flex lg:gap-10">
        <Suspense fallback={null}>
          <FilterToolbar options={options} total={total} basePath={basePath} />
        </Suspense>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} basePath={basePath} />
          <Suspense fallback={null}>
            <Pagination page={page} totalPages={totalPages} basePath={basePath} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="shell py-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
