import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollections } from "@/lib/services/catalog";
import { listProducts, getProductFacets } from "@/lib/services/products";
import { ListingLayout, ListingSkeleton } from "@/components/site/product-listing";
import { pickSearchParam, parseList } from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.name,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { title: `${collection.name} · LABONNO`, description: collection.description, images: [{ url: collection.image }] },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const collection = await getCollectionBySlug(slug);
  if (!collection || !collection.visible) notFound();

  const page = Number(pickSearchParam(query.page) ?? 1) || 1;
  const [result, facets] = await Promise.all([
    listProducts({
      collection: slug,
      minPrice: query.min ? Number(query.min) : undefined,
      maxPrice: query.max ? Number(query.max) : undefined,
      sizes: parseList(query.size),
      colors: parseList(query.color),
      sort: pickSearchParam(query.sort),
      page,
      perPage: 12,
    }),
    getProductFacets(),
  ]);

  return (
    <>
      <header className="relative">
        <div className="relative h-[320px] w-full overflow-hidden sm:h-[400px]">
          <Image src={collection.image} alt={collection.name} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/70 to-cream/10" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="shell">
            <p className="label-line text-[9.5px] text-ink-soft">Collection</p>
            <h1 className="mt-3 display-2 max-w-lg">{collection.name}</h1>
            <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">{collection.description}</p>
          </div>
        </div>
      </header>

      <Suspense fallback={<ListingSkeleton />}>
        <ListingLayout
          products={result.products}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          options={{ sizes: facets.sizes, colors: facets.colors, bounds: result.priceBounds }}
          basePath={`/collections/${slug}`}
        />
      </Suspense>
    </>
  );
}
