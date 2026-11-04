import { ProductCardSkeleton } from "@/components/ui/skeleton";

/**
 * Route-level skeleton for the storefront. Because the catalogue is read on the
 * server, this is what a visitor sees between navigation and the first paint —
 * a real skeleton keeps the page from feeling like a blank stall.
 */
export default function StorefrontLoading() {
  return (
    <div className="shell animate-fade-in py-10">
      <div className="h-3 w-24 rounded-full bg-cream-200 animate-soft-pulse" />
      <div className="mt-4 h-10 w-2/3 max-w-md rounded bg-cream-200 animate-soft-pulse" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
