import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCouponForSubtotal } from "@/lib/services/coupons";

const schema = z.object({ code: z.string().trim().min(2), subtotal: z.coerce.number().min(0) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ valid: false, discount: 0, message: "Invalid coupon" }, { status: 422 });
  const result = await validateCouponForSubtotal(parsed.data.code, parsed.data.subtotal);
  return NextResponse.json({
    valid: result.valid,
    discount: result.discount,
    message: result.valid
      ? `${result.coupon?.code} applied — you saved ৳${result.discount.toLocaleString()}.`
      : result.message,
  });
}
