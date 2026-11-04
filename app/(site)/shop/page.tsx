import type { Metadata } from "next";
import { Suspense } from "react";
import { listProducts, getProductFacets } from "@/lib/services/products";
import { getCategories } from "@/lib/services/catalog";
import { ShopHero } from "@/components/site/shop-hero";
import { CategoryRail } from "@/components/site/category-rail";
import { ListingLayout, ListingSkeleton } from "@/components/site/product-listing";
import { pickSearchParam, parseList } from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Browse the full LABONNO collection: handwoven sarees, three-piece sets, dresses, tops, bottoms, bags and jewellery. Made in limited runs in Dhaka.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(pickSearchParam(params.page) ?? 1) || 1;

  const [result, facets, categories] = await Promise.all([
    listProducts({
      category: pickSearchParam(params.category),
      collection: pickSearchParam(params.collection),
      search: pickSearchParam(params.q),
      minPrice: params.min ? Number(params.min) : undefined,
      maxPrice: params.max ? Number(params.max) : undefined,
      sizes: parseList(params.size),
      colors: parseList(params.color),
      sort: pickSearchParam(params.sort),
      page,
      perPage: 12,
    }),
    getProductFacets(),
    getCategories(),
  ]);
  const activeCategory = pickSearchParam(params.category);

  return (
    <>
      <ShopHero
        eyebrow="The collection"
        title="Shop all"
        description="Every piece is cut, embroidered and finished in our Dhaka studio and partner ateliers. Small runs, considered fabric, no repetition."
        image="/images/collection-featured.jpg"
        facts={[
          { label: "Pieces", value: String(result.total) },
          { label: "Categories", value: String(categories.length) },
          { label: "Made in", value: "Dhaka" },
        ]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
      <CategoryRail categories={categories} activeSlug={activeCategory} />
      <Suspense fallback={<ListingSkeleton />}>
        <ListingLayout
          products={result.products}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          options={{ sizes: facets.sizes, colors: facets.colors, bounds: result.priceBounds }}
          basePath="/shop"
        />
      </Suspense>
    </>
  );
}
