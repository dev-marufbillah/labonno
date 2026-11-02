import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth/server";
import { PageHeader } from "@/components/site/page-header";
import { CheckoutForm } from "@/components/site/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout at LABONNO — cash on delivery, bKash, Nagad and card payments.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);
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
        prefill={user ? { name: user.name, email: user.email, phone: user.phone ?? "" } : null}
      />
    </>
  );
}
