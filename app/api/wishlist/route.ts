import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server";
import { getWishlistIds, toggleWishlist } from "@/lib/services/wishlist";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ productIds: [] });
  const productIds = await getWishlistIds(user.id);
  return NextResponse.json({ productIds });
}

const bodySchema = z.object({ productId: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save pieces to your wishlist", requiresAuth: true }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product" }, { status: 422 });
  const result = await toggleWishlist(user.id, parsed.data.productId);
  return NextResponse.json(result);
}
