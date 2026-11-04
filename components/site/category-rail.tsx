import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { CategoryDoc } from "@/lib/db/types";

/**
 * "Shop by category" rail — circular images that scroll horizontally on a phone and wrap
 * into a quiet row on desktop. The active category is ringed in gold.
 */
export function CategoryRail({
  categories,
  activeSlug,
  basePath = "/shop",
  allLabel = "All pieces",
}: {
  categories: CategoryDoc[];
  activeSlug?: string;
  basePath?: string;
  allLabel?: string;
}) {
  if (!categories.length) return null;

  return (
    <section className="shell pt-6" data-listing-anchor>
      <div className="no-scrollbar rail flex gap-4 overflow-x-auto pb-1 sm:gap-5">
        <Link href={basePath} scroll={false} className="group flex w-[72px] shrink-0 flex-col items-center gap-2 text-center">
          <span
            className={cn(
              "grid size-[62px] place-items-center rounded-full border bg-cream-100 text-[9px] uppercase tracking-label transition sm:size-[70px]",
              !activeSlug ? "border-gold text-ink" : "border-line text-ink-muted group-hover:border-ink/40"
            )}
          >
            All
          </span>
          <span className={cn("text-[9.5px] leading-tight", !activeSlug ? "text-ink" : "text-ink-muted")}>{allLabel}</span>
        </Link>

        {categories
          .filter((category) => category.visible !== false)
          .map((category) => {
            const active = activeSlug === category.slug;
            return (
              <Link
                key={category.slug}
                href={`${basePath}?category=${category.slug}`}
                scroll={false}
                className="group flex w-[72px] shrink-0 flex-col items-center gap-2 text-center"
              >
                <span
                  className={cn(
                    "relative size-[62px] overflow-hidden rounded-full border transition sm:size-[70px]",
                    active ? "border-gold ring-1 ring-gold/40" : "border-line group-hover:border-ink/40"
                  )}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="70px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full place-items-center bg-cream-200 text-[9px] uppercase tracking-label text-ink-muted">
                      {category.name.slice(0, 2)}
                    </span>
                  )}
                </span>
                <span className={cn("text-[9.5px] leading-tight", active ? "text-ink" : "text-ink-muted group-hover:text-ink")}>
                  {category.name}
                </span>
              </Link>
            );
          })}
      </div>
    </section>
  );
}
