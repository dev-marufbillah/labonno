import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/server";
import { getWishlistProducts } from "@/lib/services/wishlist";
import { toCardData } from "@/lib/utils/product-card";
import { PageHeader } from "@/components/site/page-header";
import { WishlistView } from "@/components/site/wishlist-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Pieces you have saved from the LABONNO collection.",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const user = await getCurrentUser();
  const products = user ? await getWishlistProducts(user.id) : [];

  return (
    <>
      <PageHeader
        eyebrow="Saved for later"
        title="Wishlist"
        description={user ? "Saved to your account. We will let you know if a piece is running low." : "Your saved pieces. Sign in to keep them across devices."}
        breadcrumbs={[{ label: "Wishlist" }]}
      />
      <WishlistView initialProducts={products.map(toCardData)} />
    </>
  );
}
