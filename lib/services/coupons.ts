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

/**
 * Coupons a shopper may still use today — shown in the "Offers" band on the home page
 * and above the bag. Hidden automatically once expired, used up or switched off.
 */
export async function listActiveCoupons(limit = 3): Promise<CouponDoc[]> {
  const now = new Date();
  const docs = await col<CouponDoc>("coupons")
    .find({ active: true })
    .sort({ createdAt: -1 })
    .limit(limit * 3)
    .toArray();

  return docs
    .filter((coupon) => {
      if (coupon.startDate && new Date(coupon.startDate) > now) return false;
      if (coupon.endDate && new Date(coupon.endDate) < now) return false;
      if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return false;
      return true;
    })
    .slice(0, limit);
}
