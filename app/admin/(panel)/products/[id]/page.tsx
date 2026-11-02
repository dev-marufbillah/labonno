import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/services/products";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { AdminPageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    getCategories({ includeHidden: true }),
    getCollections({ includeHidden: true }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageTitle
        title={product.name}
        description={`Editing ${product.sku}`}
        action={
          <Link href={`/products/${product.slug}`} className="rounded-full border border-line px-5 py-2.5 text-[10px] uppercase tracking-label text-ink hover:border-ink">
            View on storefront
          </Link>
        }
      />
      <ProductForm
        product={product}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
