import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payment settings" };

export default async function PaymentSettingsPage() {
  const settings = await getSiteSettings();
  const sslConfigured = Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD);

  return (
    <div>
      <AdminPageTitle title="Payment settings" description="Enable the methods shown at checkout and set verification instructions." />
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsForm
          title="Cash on delivery"
          group="payments"
          values={{ payments: { cod: settings.payments.cod } }}
          fields={[
            { path: "payments.cod.enabled", label: "Enable cash on delivery", type: "toggle" },
            { path: "payments.cod.instructions", label: "Instructions shown at checkout", type: "textarea" },
          ]}
        />
        <SettingsForm
          title="bKash"
          group="payments"
          values={{ payments: { bkash: settings.payments.bkash } }}
          fields={[
            { path: "payments.bkash.enabled", label: "Enable bKash", type: "toggle" },
            { path: "payments.bkash.number", label: "Merchant number", type: "tel" },
            { path: "payments.bkash.instructions", label: "Instructions", type: "textarea" },
          ]}
        />
        <SettingsForm
          title="Nagad"
          group="payments"
          values={{ payments: { nagad: settings.payments.nagad } }}
          fields={[
            { path: "payments.nagad.enabled", label: "Enable Nagad", type: "toggle" },
            { path: "payments.nagad.number", label: "Merchant number", type: "tel" },
            { path: "payments.nagad.instructions", label: "Instructions", type: "textarea" },
          ]}
        />
        <div className="space-y-4">
          <SettingsForm
            title="SSLCommerz (cards)"
            group="payments"
            values={{ payments: { sslcommerz: settings.payments.sslcommerz } }}
            fields={[
              { path: "payments.sslcommerz.enabled", label: "Enable SSLCommerz", type: "toggle" },
              { path: "payments.sslcommerz.instructions", label: "Instructions", type: "textarea" },
            ]}
          />
          <Panel title="Gateway credentials">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] text-ink-soft">SSLCommerz store credentials</p>
              {sslConfigured ? <Badge tone="green">Configured</Badge> : <Badge tone="amber">Missing</Badge>}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
              Add <code>SSLCOMMERZ_STORE_ID</code> and <code>SSLCOMMERZ_STORE_PASSWORD</code> to the deployment environment.
              Until they exist, card payments stay hidden at checkout. Successful payments are only marked paid after the
              server validates <code>val_id</code> with SSLCommerz and the amount matches the order.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
