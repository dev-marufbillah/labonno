import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { requireCustomer } from "@/lib/auth/server";
import { getDefaultAddress } from "@/lib/services/addresses";
import { getEnabledPaymentMethods } from "@/lib/services/payment-methods";
import { PageHeader } from "@/components/site/page-header";
import { CheckoutForm } from "@/components/site/checkout-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout at LABONNO — cash on delivery, bKash, Nagad and card payments.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await requireCustomer("/checkout");
  const [settings, address, methods] = await Promise.all([
    getSiteSettings(),
    getDefaultAddress(user.id),
    getEnabledPaymentMethods(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Almost yours"
        title="Checkout"
        description="Cash on delivery, bKash, Nagad and card payments. Every payment is verified before dispatch."
        breadcrumbs={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]}
      />
      <CheckoutForm
        settings={settings}
        prefill={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
        address={address}
        methods={methods.map((method) => ({
          key: method.key,
          label: method.label,
          description: method.description,
          instructions: method.instructions,
          number: method.number ?? "",
          accountType: method.accountType ?? "",
          requiresReference: method.requiresReference,
          gateway: method.gateway ?? null,
          badge: method.badge ?? "",
        }))}
      />
    </>
  );
}
