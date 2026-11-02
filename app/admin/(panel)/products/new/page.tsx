import type { Metadata } from "next";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { AdminPageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([getCategories({ includeHidden: true }), getCollections({ includeHidden: true })]);
  return (
    <div>
      <AdminPageTitle title="Add product" description="Create a new piece for the collection." />
      <ProductForm
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
