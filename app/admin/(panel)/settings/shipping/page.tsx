import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Shipping settings" };

export default async function ShippingSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <AdminPageTitle title="Shipping settings" description="Delivery charges by district, free-shipping threshold and return window." />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SettingsForm
          title="Charges"
          group="shipping"
          values={{ shipping: settings.shipping }}
          fields={[
            { path: "shipping.insideDhakaCharge", label: "Inside Dhaka (৳)", type: "number" },
            { path: "shipping.outsideDhakaCharge", label: "Outside Dhaka (৳)", type: "number" },
            { path: "shipping.defaultCharge", label: "Fallback charge (৳)", type: "number" },
            { path: "shipping.freeShippingThreshold", label: "Free shipping over (৳)", type: "number", hint: "Set to 0 to disable free shipping." },
            { path: "shipping.deliveryEstimate", label: "Delivery estimate copy", type: "textarea" },
            { path: "shipping.returnWindowDays", label: "Return window (days)", type: "number" },
          ]}
        />
        <Panel title="District overrides">
          {settings.shipping.zones.length === 0 ? (
            <p className="text-[12px] text-ink-muted">No overrides — inside/outside Dhaka charges apply.</p>
          ) : (
            <ul className="space-y-2">
              {settings.shipping.zones.map((zone) => (
                <li key={zone.district} className="flex justify-between text-[12.5px]">
                  <span className="text-ink-soft">{zone.district}</span>
                  <span>{formatMoney(zone.charge)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
            Zone overrides are seeded with the catalogue and evaluated server-side at checkout, so a customer cannot
            change the delivery charge from the browser.
          </p>
        </Panel>
      </div>
    </div>
  );
}
