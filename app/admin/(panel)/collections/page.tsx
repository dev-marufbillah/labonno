import type { Metadata } from "next";
import Image from "next/image";
import { getCollections } from "@/lib/services/catalog";
import { AdminPageTitle, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CollectionDialog } from "@/components/admin/taxonomy-forms";
import { ActionButton } from "@/components/admin/action-button";
import { deleteCollection } from "@/lib/actions/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const collections = await getCollections({ includeHidden: true });

  return (
    <div>
      <AdminPageTitle title="Collections" description="Editorial edits that group products for campaigns." action={<CollectionDialog />} />
      <Panel>
        <Table>
          <THead>
            <TR>
              <TH>Collection</TH>
              <TH>Slug</TH>
              <TH>Tagline</TH>
              <TH>Featured</TH>
              <TH>Visible</TH>
              <TH>Order</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {collections.map((collection) => (
              <TR key={String(collection._id)}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-cream-200">
                      <Image src={collection.image} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <span className="font-medium text-ink">{collection.name}</span>
                  </div>
                </TD>
                <TD>/{collection.slug}</TD>
                <TD className="max-w-[220px] truncate">{collection.tagline}</TD>
                <TD>{collection.featured ? <Badge tone="gold">Featured</Badge> : <Badge>—</Badge>}</TD>
                <TD>{collection.visible ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>}</TD>
                <TD>{collection.order}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <CollectionDialog collection={collection} />
                    <ActionButton
                      action={async () => deleteCollection(String(collection._id))}
                      label="Delete"
                      destructive
                      confirmTitle="Delete this collection?"
                      confirmDescription="Products will be unlinked from this collection."
                      confirmLabel="Delete"
                    />
                  </div>
                </TD>
              </TR>
            ))}
            {collections.length === 0 ? <TableEmpty colSpan={7} message="No collections yet." /> : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
