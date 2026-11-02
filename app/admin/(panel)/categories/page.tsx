import type { Metadata } from "next";
import Image from "next/image";
import { getCategories, getProductCountsByCategory } from "@/lib/services/catalog";
import { AdminPageTitle, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CategoryDialog } from "@/components/admin/taxonomy-forms";
import { ActionButton } from "@/components/admin/action-button";
import { deleteCategory } from "@/lib/actions/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories({ includeHidden: true }), getProductCountsByCategory()]);

  return (
    <div>
      <AdminPageTitle
        title="Categories"
        description="The six ways the collection is organised on the storefront."
        action={<CategoryDialog />}
      />
      <Panel>
        <Table>
          <THead>
            <TR>
              <TH>Category</TH>
              <TH>Slug</TH>
              <TH>Products</TH>
              <TH>Homepage</TH>
              <TH>Visible</TH>
              <TH>Order</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {categories.map((category) => (
              <TR key={String(category._id)}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-cream-200">
                      <Image src={category.image} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{category.name}</p>
                      <p className="text-[10px] text-ink-muted">{category.tagline}</p>
                    </div>
                  </div>
                </TD>
                <TD>/{category.slug}</TD>
                <TD>{counts[category.slug] ?? 0}</TD>
                <TD>{category.showOnHome ? <Badge tone="gold">Shown</Badge> : <Badge>Hidden</Badge>}</TD>
                <TD>{category.visible ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>}</TD>
                <TD>{category.order}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <CategoryDialog category={category} />
                    <ActionButton
                      action={async () => deleteCategory(String(category._id))}
                      label="Delete"
                      destructive
                      confirmTitle="Delete this category?"
                      confirmDescription="Products must be moved to another category first."
                      confirmLabel="Delete"
                    />
                  </div>
                </TD>
              </TR>
            ))}
            {categories.length === 0 ? <TableEmpty colSpan={7} message="No categories yet." /> : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
