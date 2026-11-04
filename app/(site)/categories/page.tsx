import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/services/catalog";
import { getProductFacets } from "@/lib/services/products";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All categories",
  description: "Every category in the LABONNO wardrobe — sarees, three-piece sets, dresses, tops, bottoms and accessories.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const [categories, facets] = await Promise.all([getCategories(), getProductFacets().catch(() => ({ categories: [] as { slug: string; count: number }[] }))]);
  const visible = categories.filter((category) => category.visible !== false);
  const counts = new Map((facets as { categories?: { slug: string; count: number }[] }).categories?.map((item) => [item.slug, item.count]) ?? []);

  return (
    <div className="shell py-10 md:py-14">
      <div className="text-center">
        <p className="eyebrow">The wardrobe</p>
        <h1 className="display-2 mt-3">Shop by category</h1>
        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-ink-muted">
          Everything the studio makes, in one list. Pick a category to see the pieces, or{" "}
          <Link href="/shop" className="text-ink underline underline-offset-4">
            browse the full collection
          </Link>
          .
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((category, index) => (
          <Reveal key={category.slug} delay={(index % 3) * 70}>
            <Link
              href={`/category/${category.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-cream-50 transition duration-300 hover:-translate-y-0.5 hover:border-gold"
            >
              <div className="relative aspect-[16/10] w-full bg-cream-200">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-serif text-lg text-ink">{category.name}</p>
                  <p className="text-[10.5px] uppercase tracking-label text-ink-muted">
                    {counts.get(category.slug) ?? 0} pieces
                  </p>
                </div>
                <ArrowRight className="size-4 -translate-x-1 text-gold-dark opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" strokeWidth={1.5} />
              </div>
            </Link>
          </Reveal>
        ))}

        <Link
          href="/shop"
          className="group flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/60 bg-gradient-to-br from-cream-100 to-cream-50 p-6 text-center transition hover:border-gold"
        >
          <span className="grid size-12 place-items-center rounded-full border border-gold/60 text-gold-dark transition group-hover:scale-110">
            <ArrowRight className="size-5" strokeWidth={1.4} />
          </span>
          <p className="font-serif text-lg text-ink">Shop everything</p>
          <p className="text-[11px] uppercase tracking-label text-ink-muted">All pieces in one grid</p>
        </Link>
      </div>
    </div>
  );
}
