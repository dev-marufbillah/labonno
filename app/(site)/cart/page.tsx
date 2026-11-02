import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/site/page-header";
import { CartView } from "@/components/site/cart-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping bag",
  description: "Review your LABONNO bag before checkout.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader eyebrow="Your selection" title="Shopping bag" breadcrumbs={[{ label: "Bag" }]} />
      <CartView freeShippingThreshold={settings.shipping.freeShippingThreshold} />
    </>
  );
}
