import { NextResponse } from "next/server";
import { col } from "@/lib/db/mongo";
import { reviewSchema } from "@/lib/validations";
import { getProductById } from "@/lib/services/products";
import { requireApiUser } from "@/lib/auth/guards";
import type { ReviewDoc } from "@/lib/db/types";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireApiUser("/account/orders");
    if (error || !user) return error!;

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review" }, { status: 422 });
    }
    const product = await getProductById(parsed.data.productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const review: ReviewDoc = {
      productId: parsed.data.productId,
      productSlug: product.slug,
      productName: product.name,
      userId: user.id,
      author: parsed.data.author || user.name,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      status: "pending",
      verifiedPurchase: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await col<ReviewDoc>("reviews").insertOne(review);
    return NextResponse.json({ message: "Thank you — your review is with our team for approval." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
}
