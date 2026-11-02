import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getProductCountsByCategory } from "@/lib/services/catalog";
import { PageHeader } from "@/components/site/page-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore LABONNO by category — saree, three piece, dresses, tops, bottoms and accessories.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getProductCountsByCategory()]);

  return (
    <>
      <PageHeader
        eyebrow="Browse"
        title="Categories"
        description="Six categories, each developed with a specific craft partner — from jamdani weavers in Rupganj to leather workers in Old Dhaka."
        breadcrumbs={[{ label: "Categories" }]}
      />
      <section className="shell py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream-200">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[9.5px] uppercase tracking-label text-cream/70">{category.tagline}</p>
                  <h2 className="mt-1 font-serif text-2xl text-cream">{category.name}</h2>
                  <p className="mt-1 text-[11.5px] text-cream/70">{counts[category.slug] ?? 0} pieces</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="max-w-[85%] text-[12.5px] leading-relaxed text-ink-muted">{category.description}</p>
                <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
