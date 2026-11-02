import "server-only";
import { col } from "@/lib/db/mongo";
import type { CouponDoc } from "@/lib/db/types";
import { evaluateCoupon, type CouponEvaluation } from "./pricing";

export async function findCoupon(code: string): Promise<CouponDoc | null> {
  if (!code) return null;
  return col<CouponDoc>("coupons").findOne({ code: code.toUpperCase().trim() });
}

export async function validateCouponForSubtotal(code: string, subtotal: number): Promise<CouponEvaluation> {
  const coupon = await findCoupon(code);
  if (!coupon) return { valid: false, discount: 0, message: "This coupon code is not valid." };
  return evaluateCoupon(coupon, subtotal);
}

export async function listCoupons(): Promise<CouponDoc[]> {
  return col<CouponDoc>("coupons").find({}).sort({ createdAt: -1 }).toArray();
}
