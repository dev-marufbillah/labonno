import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories } from "@/lib/services/catalog";
import { listProducts, getProductFacets } from "@/lib/services/products";
import { PageHeader } from "@/components/site/page-header";
import { ListingLayout, ListingSkeleton } from "@/components/site/product-listing";
import { pickSearchParam, parseList } from "@/lib/utils/helpers";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description || `Shop ${category.name} at LABONNO.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `${category.name} · LABONNO`,
      description: category.description,
      images: [{ url: category.image }],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category || !category.visible) notFound();

  const page = Number(pickSearchParam(query.page) ?? 1) || 1;
  const [result, facets] = await Promise.all([
    listProducts({
      category: slug,
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
      <PageHeader
        eyebrow={category.tagline}
        title={category.name}
        description={category.description}
        breadcrumbs={[{ label: "Shop", href: "/shop" }, { label: category.name }]}
      />
      <Suspense fallback={<ListingSkeleton />}>
        <ListingLayout
          products={result.products}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          options={{
            sizes: facets.sizes.filter((s) => result.products.some((p) => p.sizes.includes(s))).length
              ? [...new Set(result.products.flatMap((p) => p.sizes))]
              : facets.sizes,
            colors: facets.colors,
            bounds: result.priceBounds,
          }}
          basePath={`/category/${slug}`}
        />
      </Suspense>
    </>
  );
}
