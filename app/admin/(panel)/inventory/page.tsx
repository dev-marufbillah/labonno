import type { Metadata } from "next";
import Link from "next/link";
import { col } from "@/lib/db/mongo";
import type { InventoryLogDoc, ProductDoc } from "@/lib/db/types";
import { AdminPageTitle, AdminSearch, Panel, StatCard, TableEmpty } from "@/components/admin/ui";
import { StockAdjuster } from "@/components/admin/stock-adjuster";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const filter = params.q
    ? { $or: [{ name: new RegExp(params.q, "i") }, { sku: new RegExp(params.q, "i") }] }
    : {};
  const [products, logs] = await Promise.all([
    col<ProductDoc>("products").find(filter).sort({ stock: 1 }).limit(60).toArray(),
    col<InventoryLogDoc>("inventory_logs").find({}).sort({ createdAt: -1 }).limit(15).toArray(),
  ]);

  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
  const outOfStock = products.filter((product) => product.stock <= 0).length;

  return (
    <div>
      <AdminPageTitle title="Inventory" description="Adjust variant stock. Every change is written to the inventory log." />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Units in stock" value={String(totalUnits)} />
        <StatCard label="Low stock" value={String(lowStock)} tone="warning" hint="5 units or fewer" />
        <StatCard label="Out of stock" value={String(outOfStock)} tone="warning" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Stock by variant">
          <div className="mb-3">
            <AdminSearch action="/admin/inventory" placeholder="Search product or SKU" defaultValue={params.q} />
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Product</TH>
                <TH>Variant</TH>
                <TH>Stock</TH>
                <TH>Total</TH>
              </TR>
            </THead>
            <tbody>
              {products.flatMap((product) =>
                product.variants.slice(0, 4).map((variant, index) => (
                  <TR key={`${String(product._id)}-${variant.sku}`}>
                    <TD>
                      {index === 0 ? (
                        <Link href={`/admin/products/${product._id}`} className="font-medium text-ink hover:text-gold-dark">
                          {product.name}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">↳</span>
                      )}
                    </TD>
                    <TD className="text-[11.5px]">{variant.size} · {variant.color}</TD>
                    <TD>
                      <StockAdjuster
                        productId={String(product._id)}
                        size={variant.size}
                        color={variant.color}
                        stock={variant.stock}
                      />
                    </TD>
                    <TD>{index === 0 ? product.stock : ""}</TD>
                  </TR>
                ))
              )}
              {products.length === 0 ? <TableEmpty colSpan={4} message="No products found." /> : null}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Recent movements">
          <ul className="space-y-2.5">
            {logs.map((log) => (
              <li key={String(log._id)} className="border-b border-line/60 pb-2 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] text-ink">{log.productName}</span>
                  <span className={`shrink-0 text-[11.5px] ${log.change < 0 ? "text-red-700" : "text-emerald-800"}`}>
                    {log.change > 0 ? "+" : ""}{log.change}
                  </span>
                </div>
                <p className="text-[10px] text-ink-muted">
                  {log.reason} · {formatDateTime(log.createdAt)}
                </p>
              </li>
            ))}
            {logs.length === 0 ? <li className="text-[12px] text-ink-muted">No stock movements recorded yet.</li> : null}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
