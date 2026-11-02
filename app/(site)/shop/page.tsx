import type { Metadata } from "next";
import { Suspense } from "react";
import { listProducts, getProductFacets } from "@/lib/services/products";
import { PageHeader } from "@/components/site/page-header";
import { ListingLayout, ListingSkeleton } from "@/components/site/product-listing";
import { pickSearchParam, parseList } from "@/lib/utils/helpers";

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

  const [result, facets] = await Promise.all([
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
  ]);

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title="Shop all"
        description="Every piece is cut, embroidered and finished in our Dhaka studio and partner ateliers. Small runs, considered fabric, no repetition."
        breadcrumbs={[{ label: "Shop" }]}
      />
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
