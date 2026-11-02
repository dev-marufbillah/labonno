import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCollections } from "@/lib/services/catalog";
import { PageHeader } from "@/components/site/page-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
  description: "LABONNO collections — Timeless Elegance, Black Zari, Sage Fest and Velvet Luxe.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <PageHeader
        eyebrow="Edits"
        title="Collections"
        description="Capsule edits built around a single idea — a craft, a colour, a season. Each runs for a limited time and is not repeated."
        breadcrumbs={[{ label: "Collections" }]}
      />
      <section className="shell py-12 md:py-16">
        <div className="space-y-8 md:space-y-12">
          {collections.map((collection, index) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group grid overflow-hidden rounded-xl border border-line/70 bg-cream-50 md:grid-cols-2"
            >
              <div className={`relative aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[340px] ${index % 2 === 1 ? "md:order-2" : ""}`}>
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col justify-center p-7 md:p-12">
                <p className="label-line text-[9.5px]">{collection.tagline}</p>
                <h2 className="mt-4 font-serif text-3xl font-light md:text-4xl">{collection.name}</h2>
                <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">{collection.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-label text-ink">
                  Explore the edit
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
