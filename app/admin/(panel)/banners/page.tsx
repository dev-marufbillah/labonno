import type { Metadata } from "next";
import Image from "next/image";
import { getAllBanners } from "@/lib/services/content";
import { AdminPageTitle, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BannerDialog } from "@/components/admin/banner-form";
import { ActionButton } from "@/components/admin/action-button";
import { deleteBanner, saveBanner } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const banners = await getAllBanners();

  return (
    <div>
      <AdminPageTitle title="Banners & sliders" description="Hero slides, promotional strips and popups." action={<BannerDialog />} />
      <Panel>
        <Table>
          <THead>
            <TR>
              <TH>Banner</TH>
              <TH>Placement</TH>
              <TH>Link</TH>
              <TH>Order</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {banners.map((banner) => (
              <TR key={String(banner._id)}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-cream-200">
                      <Image src={banner.image} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{banner.title}</p>
                      <p className="text-[10px] text-ink-muted">{banner.eyebrow} {banner.subtitle}</p>
                    </div>
                  </div>
                </TD>
                <TD className="capitalize">{banner.placement.replace(/_/g, " ")}</TD>
                <TD className="text-[11px]">{banner.ctaLabel} → {banner.ctaHref}</TD>
                <TD>{banner.order}</TD>
                <TD>{banner.visible ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <BannerDialog banner={banner} />
                    <ActionButton
                      action={async () => {
                        "use server";
                        return saveBanner({ ...banner, visible: !banner.visible }, String(banner._id));
                      }}
                      label={banner.visible ? "Hide" : "Show"}
                    />
                    <ActionButton
                      action={async () => {
                        "use server";
                        return deleteBanner(String(banner._id));
                      }}
                      label="Delete"
                      destructive
                      confirmTitle="Delete this banner?"
                      confirmDescription="The slide will be removed from the homepage immediately."
                      confirmLabel="Delete"
                    />
                  </div>
                </TD>
              </TR>
            ))}
            {banners.length === 0 ? <TableEmpty colSpan={6} message="No banners yet." /> : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
