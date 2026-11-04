import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { requireCustomer } from "@/lib/auth/server";
import { PageHeader } from "@/components/site/page-header";
import { CartView } from "@/components/site/cart-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping bag",
  description: "Review your LABONNO bag before checkout.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  // The bag belongs to a customer: no anonymous carts, no orphan orders.
  await requireCustomer("/cart");
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader eyebrow="Your selection" title="Shopping bag" breadcrumbs={[{ label: "Bag" }]} />
      <CartView freeShippingThreshold={settings.shipping.freeShippingThreshold} />
    </>
  );
}
