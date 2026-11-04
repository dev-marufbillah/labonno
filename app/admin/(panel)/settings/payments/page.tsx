import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { PaymentMethodsManager, type PaymentMethodView } from "@/components/admin/payment-methods-manager";
import { listPaymentMethods } from "@/lib/services/payment-methods";
import { isBkashConfigured } from "@/lib/payments/bkash";
import { sslcommerzConfigured } from "@/lib/payments/sslcommerz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payment methods" };

export default async function PaymentSettingsPage() {
  const methods = await listPaymentMethods();

  const views: PaymentMethodView[] = methods.map((method) => ({
    id: String(method._id),
    key: method.key,
    label: method.label,
    kind: method.kind,
    enabled: method.enabled,
    order: method.order,
    description: method.description,
    instructions: method.instructions,
    number: method.number ?? "",
    accountType: method.accountType ?? "",
    requiresReference: method.requiresReference,
    gateway: method.gateway ?? null,
    badge: method.badge ?? "",
    hasCredentials: Boolean(
      method.config && Object.values(method.config).some((value) => typeof value === "string" && value.length > 0)
    ),
    sandbox: method.config?.sandbox ?? true,
  }));

  return (
    <div className="space-y-5">
      <AdminPageTitle
        title="Payment methods"
        description="Add, reorder, switch off or delete any way of paying — checkout updates instantly."
        action={
          <Link href="/admin/orders" className="rounded-full border border-line px-5 py-2.5 text-[10px] uppercase tracking-label text-ink hover:bg-cream-200/60">
            See orders
          </Link>
        }
      />

      <Panel className="p-5">
        <PaymentMethodsManager methods={views} />
      </Panel>

      <Panel className="space-y-2 p-5 text-[11.5px] leading-relaxed text-ink-muted">
        <p className="text-[10px] uppercase tracking-label text-ink">Gateway status</p>
        <p>
          bKash tokenized checkout:{" "}
          <span className={isBkashConfigured() ? "text-emerald-700" : "text-amber-700"}>
            {isBkashConfigured() ? "keys found — live redirect available" : "no keys yet (manual bKash still works)"}
          </span>
        </p>
        <p>
          SSLCommerz:{" "}
          <span className={sslcommerzConfigured() ? "text-emerald-700" : "text-amber-700"}>
            {sslcommerzConfigured() ? "keys found — card payments available" : "no keys yet"}
          </span>
        </p>
        <p>
          Add keys either in the method above or in <code className="font-mono">.env.local</code>{" "}
          (<code className="font-mono">BKASH_APP_KEY</code>, <code className="font-mono">BKASH_APP_SECRET</code>,{" "}
          <code className="font-mono">BKASH_USERNAME</code>, <code className="font-mono">BKASH_PASSWORD</code>,{" "}
          <code className="font-mono">SSLCOMMERZ_STORE_ID</code>, <code className="font-mono">SSLCOMMERZ_STORE_PASSWORD</code>).
        </p>
      </Panel>
    </div>
  );
}
