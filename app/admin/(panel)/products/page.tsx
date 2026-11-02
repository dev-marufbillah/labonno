import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/catalog";
import { AdminPageTitle, AdminSearch, PaginationBar, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { ActionButton } from "@/components/admin/action-button";
import { deleteProduct, setProductFlags } from "@/lib/actions/catalog";
import { formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const [result, categories] = await Promise.all([
    listProducts({
      search: params.q,
      category: params.category,
      status: "all",
      page,
      perPage: 20,
      sort: "newest",
    }),
    getCategories({ includeHidden: true }),
  ]);

  return (
    <div>
      <AdminPageTitle
        title="Products"
        description={`${result.total} products in the catalogue`}
        action={
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft">
            <Plus className="size-3" /> Add product
          </Link>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <AdminSearch action="/admin/products" placeholder="Search name, SKU or tag" defaultValue={params.q} />
          <form action="/admin/products" className="flex items-center gap-2">
            <select name="category" defaultValue={params.category ?? ""} className="h-9 rounded-md border border-line bg-white/70 px-2 text-[12px]">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
            <button type="submit" className="h-9 rounded-md border border-line px-3 text-[10px] uppercase tracking-wide2 hover:border-ink">Filter</button>
          </form>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>Category</TH>
              <TH>Price</TH>
              <TH>Stock</TH>
              <TH>Status</TH>
              <TH>Flags</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {result.products.map((product) => (
              <TR key={String(product._id)}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-cream-200">
                      <Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${product._id}`} className="block truncate font-medium text-ink hover:text-gold-dark">
                        {product.name}
                      </Link>
                      <p className="text-[10px] text-ink-muted">{product.sku}</p>
                    </div>
                  </div>
                </TD>
                <TD className="capitalize">{product.category.replace(/-/g, " ")}</TD>
                <TD>
                  {formatMoney(product.salePrice ?? product.price)}
                  {product.salePrice ? <span className="ml-1 text-[10px] text-ink-muted line-through">{formatMoney(product.price)}</span> : null}
                </TD>
                <TD>
                  <span className={product.stock <= 0 ? "text-red-700" : product.stock <= 5 ? "text-amber-700" : ""}>
                    {product.stock}
                  </span>
                </TD>
                <TD><StatusBadge value={product.status} /></TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {product.featured ? <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[9px] uppercase text-gold-dark">Featured</span> : null}
                    {product.newArrival ? <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] uppercase text-blue-800">New</span> : null}
                    {product.bestSeller ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] uppercase text-emerald-800">Best</span> : null}
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <ActionButton
                      action={async () => setProductFlags(String(product._id), { status: product.status === "published" ? "draft" : "published" })}
                      label={product.status === "published" ? "Unpublish" : "Publish"}
                    />
                    <Link href={`/admin/products/${product._id}`} className="rounded-full border border-line px-3 py-2 text-[10px] uppercase tracking-wide2 text-ink hover:border-ink">
                      Edit
                    </Link>
                    <ActionButton
                      action={async () => deleteProduct(String(product._id))}
                      label="Delete"
                      destructive
                      confirmTitle="Delete this product?"
                      confirmDescription={`${product.name} will be removed from the storefront. This cannot be undone.`}
                      confirmLabel="Delete product"
                    />
                  </div>
                </TD>
              </TR>
            ))}
            {result.products.length === 0 ? <TableEmpty colSpan={7} message="No products found. Adjust your search or add a product." /> : null}
          </tbody>
        </Table>

        <PaginationBar page={result.page} totalPages={result.totalPages} basePath="/admin/products" params={{ q: params.q, category: params.category }} />
      </Panel>
    </div>
  );
}
