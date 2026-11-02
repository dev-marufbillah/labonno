import { NextResponse } from "next/server";
import { col } from "@/lib/db/mongo";
import { reviewSchema } from "@/lib/validations";
import { getProductById } from "@/lib/services/products";
import { getCurrentUser } from "@/lib/auth/server";
import type { ReviewDoc } from "@/lib/db/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review" }, { status: 422 });
    }
    const product = await getProductById(parsed.data.productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const user = await getCurrentUser();
    const review: ReviewDoc = {
      productId: parsed.data.productId,
      productSlug: product.slug,
      productName: product.name,
      userId: user?.id ?? null,
      author: parsed.data.author,
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
