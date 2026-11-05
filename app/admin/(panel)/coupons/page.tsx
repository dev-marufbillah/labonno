import type { Metadata } from "next";
import { listCoupons } from "@/lib/services/coupons";
import { AdminPageTitle, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CouponDialog } from "@/components/admin/coupon-form";
import { ActionButton } from "@/components/admin/action-button";
import { deleteCoupon, saveCoupon } from "@/lib/actions/marketing";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Discounts" };

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div>
      <AdminPageTitle title="Discounts & coupons" description="Every code is re-validated on the server at checkout." action={<CouponDialog />} />
      <Panel>
        <Table>
          <THead>
            <TR>
              <TH>Code</TH>
              <TH>Discount</TH>
              <TH>Minimum</TH>
              <TH>Used</TH>
              <TH>Window</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {coupons.map((coupon) => (
              <TR key={String(coupon._id)}>
                <TD>
                  <p className="font-medium tracking-wide2 text-ink">{coupon.code}</p>
                  <p className="text-[10.5px] text-ink-muted">{coupon.description}</p>
                </TD>
                <TD>{coupon.type === "percentage" ? `${coupon.value}%` : formatMoney(coupon.value)}{coupon.maxDiscount ? ` · max ${formatMoney(coupon.maxDiscount)}` : ""}</TD>
                <TD>{coupon.minSubtotal ? formatMoney(coupon.minSubtotal) : "—"}</TD>
                <TD>{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</TD>
                <TD className="text-[11px]">
                  {coupon.startDate ? formatDate(coupon.startDate) : "—"} → {coupon.endDate ? formatDate(coupon.endDate) : "—"}
                </TD>
                <TD>{coupon.active ? <Badge tone="green">Active</Badge> : <Badge>Paused</Badge>}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    <CouponDialog coupon={coupon} />
                    <ActionButton
                      action={async () => {
                        "use server";
                        return saveCoupon({ ...coupon, active: !coupon.active }, String(coupon._id));
                      }}
                      label={coupon.active ? "Pause" : "Activate"}
                    />
                    <ActionButton
                      action={async () => {
                        "use server";
                        return deleteCoupon(String(coupon._id));
                      }}
                      label="Delete"
                      destructive
                      confirmTitle="Delete this coupon?"
                      confirmDescription={`${coupon.code} will stop working immediately.`}
                      confirmLabel="Delete"
                    />
                  </div>
                </TD>
              </TR>
            ))}
            {coupons.length === 0 ? <TableEmpty colSpan={7} message="No coupons yet. Create one to run a promotion." /> : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
