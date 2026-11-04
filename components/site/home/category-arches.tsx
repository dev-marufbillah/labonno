import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import type { CategoryDoc } from "@/lib/db/types";

/**
 * The arch row on the homepage.
 *
 * Shows the categories the owner picked (or the first few visible ones) and always
 * closes with a "+ See all" arch that opens /categories — so a shopper can browse
 * everything the studio makes without hunting through the menu.
 */
export function CategoryArches({
  categories,
  limit = 4,
  showSeeAll = true,
  seeAllHref = "/categories",
}: {
  categories: CategoryDoc[];
  limit?: number;
  showSeeAll?: boolean;
  seeAllHref?: string;
}) {
  if (!categories.length && !showSeeAll) return null;

  const shown = categories.slice(0, Math.max(limit, 1));
  const remaining = Math.max(categories.length - shown.length, 0);

  return (
    <section className="shell pt-10 md:pt-14">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        {shown.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`} className="group block">
            <div className="relative aspect-[3/4.6] w-full overflow-hidden rounded-t-full rounded-b-lg bg-cream-200">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
                />
              ) : (
                <span className="grid h-full place-items-center text-[11px] uppercase tracking-label text-ink-muted">
                  {category.name}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="font-serif text-[15px] text-ink sm:text-base">{category.name}</span>
              <ArrowRight
                className="size-3 -translate-x-1 text-ink-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                strokeWidth={1.5}
              />
            </div>
          </Link>
        ))}

        {showSeeAll ? (
          <Link href={seeAllHref} className="group block">
            <div className="relative grid aspect-[3/4.6] w-full place-items-center overflow-hidden rounded-t-full rounded-b-lg border border-dashed border-gold/60 bg-gradient-to-b from-cream-100 to-cream-50 transition-colors duration-500 group-hover:border-gold">
              <span className="grid size-14 place-items-center rounded-full border border-gold/60 text-gold-dark transition-transform duration-500 group-hover:scale-110 group-hover:bg-gold/10 sm:size-16">
                <Plus className="size-6" strokeWidth={1.4} />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="font-serif text-[15px] text-ink sm:text-base">See all</span>
              {remaining > 0 ? (
                <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[9.5px] uppercase tracking-wide2 text-ink-soft">
                  +{remaining}
                </span>
              ) : null}
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
