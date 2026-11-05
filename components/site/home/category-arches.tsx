import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { CategoryDoc } from "@/lib/db/types";

/**
 * The arch row on the homepage.
 *
 * Layout (v2): the arches the owner picked stay on ONE line — four on desktop —
 * and the "see everything" control sits at the end of that same line as a slim
 * arrow, so it never wraps onto a line of its own and leave half the row empty.
 *
 * The arrow (and the small "See all" link on phones) opens the full category
 * index at /categories, where every category the studio has is listed.
 */
export function CategoryArches({
  categories,
  limit = 4,
  showSeeAll = true,
  seeAllHref = "/categories",
  seeAllLabel = "See all",
}: {
  categories: CategoryDoc[];
  limit?: number;
  showSeeAll?: boolean;
  seeAllHref?: string;
  seeAllLabel?: string;
}) {
  if (!categories.length && !showSeeAll) return null;

  const shown = categories.slice(0, Math.max(limit, 1));
  const remaining = Math.max(categories.length - shown.length, 0);

  return (
    <section className="shell pt-10 md:pt-14">
      <div className="flex items-start gap-3 md:gap-5">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
          {shown.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="group block">
              <div className="relative aspect-[3/4.6] w-full overflow-hidden rounded-t-full rounded-b-lg border border-line/60 bg-cream-200">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="grid h-full place-items-center px-3 text-center">
                    <span className="font-serif text-[13px] uppercase tracking-wide2 text-ink-muted sm:text-sm">
                      {category.name}
                    </span>
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
        </div>

        {showSeeAll ? (
          <div className="hidden shrink-0 flex-col items-center justify-center gap-2 self-stretch md:flex">
            <Link
              href={seeAllHref}
              aria-label={seeAllLabel}
              title={seeAllLabel}
              className="group grid size-11 place-items-center rounded-full border border-gold/60 bg-cream-50 text-gold-dark transition-all duration-300 hover:border-gold hover:bg-gold/10"
            >
              <ChevronRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.6}
              />
            </Link>
            {remaining > 0 ? (
              <span className="text-[9px] uppercase tracking-label text-ink-muted">+{remaining}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Phones: the arrow would squeeze the two arches, so a quiet text link follows the row. */}
      {showSeeAll ? (
        <div className="mt-5 flex justify-center md:hidden">
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1.5 border-b border-gold/50 pb-0.5 text-[11px] uppercase tracking-label text-ink-soft hover:border-gold hover:text-ink"
          >
            {seeAllLabel}
            {remaining > 0 ? <span className="text-ink-muted">({categories.length})</span> : null}
            <ChevronRight className="size-3" strokeWidth={1.6} />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
