"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import { couponSchema } from "@/lib/validations";
import type { CouponDoc, ReviewDoc } from "@/lib/db/types";
import { audit, fail, requireActor, type ActionState } from "./helpers";

export async function saveCoupon(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = couponSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check the coupon details.",
        fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])),
      };
    }
    const coupons = col<CouponDoc>("coupons");
    const payload = { ...parsed.data, updatedAt: new Date() };
    if (id) {
      await coupons.updateOne({ _id: new ObjectId(id) }, { $set: payload });
    } else {
      const exists = await coupons.findOne({ code: payload.code });
      if (exists) return { ok: false, message: "That coupon code already exists." };
      await coupons.insertOne({ ...payload, usedCount: 0, createdAt: new Date() } as CouponDoc);
    }
    await audit(actor.email, id ? "coupon.update" : "coupon.create", `coupon:${payload.code}`);
    revalidatePath("/admin/coupons");
    return { ok: true, message: id ? "Coupon updated." : "Coupon created." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCoupon(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    await col<CouponDoc>("coupons").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "coupon.delete", `coupon:${id}`);
    revalidatePath("/admin/coupons");
    return { ok: true, message: "Coupon deleted." };
  } catch (error) {
    return fail(error);
  }
}

export async function setReviewStatus(id: string, status: ReviewDoc["status"]): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const reviews = col<ReviewDoc>("reviews");
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid review." };
    const review = await reviews.findOne({ _id: new ObjectId(id) });
    if (!review) return { ok: false, message: "Review not found." };
    await reviews.updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });

    const approved = await reviews
      .aggregate<{ _id: null; avg: number; count: number }>([
        { $match: { productId: review.productId, status: "approved" } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ])
      .toArray();
    await col("products").updateOne(
      { _id: new ObjectId(review.productId) },
      { $set: { rating: Math.round((approved[0]?.avg ?? 0) * 10) / 10, reviewCount: approved[0]?.count ?? 0 } }
    ).catch(() => undefined);

    await audit(actor.email, "review.status", `review:${id}`, { status });
    revalidatePath("/admin/reviews");
    revalidatePath(`/products/${review.productSlug}`);
    return { ok: true, message: `Review ${status}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteReview(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    await col<ReviewDoc>("reviews").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "review.delete", `review:${id}`);
    revalidatePath("/admin/reviews");
    return { ok: true, message: "Review deleted." };
  } catch (error) {
    return fail(error);
  }
}
