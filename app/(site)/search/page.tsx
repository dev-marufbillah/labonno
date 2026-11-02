import type { Metadata } from "next";
import { Suspense } from "react";
import { listProducts, getProductFacets } from "@/lib/services/products";
import { PageHeader } from "@/components/site/page-header";
import { ListingLayout, ListingSkeleton } from "@/components/site/product-listing";
import { pickSearchParam, parseList } from "@/lib/utils/helpers";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the LABONNO collection.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = pickSearchParam(params.q) ?? "";
  const page = Number(pickSearchParam(params.page) ?? 1) || 1;

  const [result, facets] = await Promise.all([
    query
      ? listProducts({
          search: query,
          minPrice: params.min ? Number(params.min) : undefined,
          maxPrice: params.max ? Number(params.max) : undefined,
          sizes: parseList(params.size),
          colors: parseList(params.color),
          sort: pickSearchParam(params.sort),
          page,
          perPage: 12,
        })
      : Promise.resolve({ products: [], total: 0, page: 1, perPage: 12, totalPages: 1, priceBounds: { min: 0, max: 20000 } }),
    getProductFacets(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={query ? `“${query}”` : "Search the house"}
        description={
          query
            ? `${result.total} ${result.total === 1 ? "piece" : "pieces"} found. Refine by size, colour or price.`
            : "Search by name, category or SKU — sarees, three-piece sets, dresses, tops and accessories."
        }
        breadcrumbs={[{ label: "Search" }]}
      />
      <Suspense fallback={<ListingSkeleton />}>
        <ListingLayout
          products={result.products}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          options={{ sizes: facets.sizes, colors: facets.colors, bounds: result.priceBounds }}
          basePath="/search"
        />
      </Suspense>
    </>
  );
}
