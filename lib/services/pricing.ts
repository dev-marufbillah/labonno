import type { ProductDoc, CouponDoc, SiteSettingsDoc } from "@/lib/db/types";
import { effectivePrice } from "@/lib/utils/format";

export interface CartLineInput {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface PricedLine {
  product: ProductDoc;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  availableStock: number;
}

export function priceLine(product: ProductDoc, size: string, color: string, quantity: number): PricedLine {
  const variant = product.variants?.find((v) => v.size === size && v.color === color);
  const unitPrice = effectivePrice(product);
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
  return {
    product,
    size,
    color,
    quantity: qty,
    unitPrice,
    lineTotal: unitPrice * qty,
    availableStock: variant?.stock ?? product.stock,
  };
}

export interface CouponEvaluation {
  valid: boolean;
  discount: number;
  message: string;
  coupon?: CouponDoc;
}

export function evaluateCoupon(coupon: CouponDoc | null, subtotal: number): CouponEvaluation {
  if (!coupon) return { valid: false, discount: 0, message: "Coupon not found." };
  if (!coupon.active) return { valid: false, discount: 0, message: "This coupon is no longer active." };
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now)
    return { valid: false, discount: 0, message: "This coupon is not active yet." };
  if (coupon.endDate && new Date(coupon.endDate) < now)
    return { valid: false, discount: 0, message: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { valid: false, discount: 0, message: "This coupon has reached its usage limit." };
  if (subtotal < (coupon.minSubtotal ?? 0))
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ৳${coupon.minSubtotal.toLocaleString()} required for this coupon.`,
    };

  let discount =
    coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : Math.round(coupon.value);
  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  discount = Math.min(discount, subtotal);

  return { valid: true, discount, message: "Coupon applied.", coupon };
}

export function computeTotals(args: {
  lines: PricedLine[];
  couponEvaluation?: CouponEvaluation | null;
  deliveryCharge: number;
  settings: SiteSettingsDoc;
}) {
  const subtotal = args.lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = args.couponEvaluation?.valid ? args.couponEvaluation.discount : 0;
  const threshold = args.settings.shipping.freeShippingThreshold;
  const deliveryCharge = threshold > 0 && subtotal - discount >= threshold ? 0 : args.deliveryCharge;
  const total = Math.max(0, subtotal - discount) + deliveryCharge;
  return { subtotal, discount, deliveryCharge, total };
}
