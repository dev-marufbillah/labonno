import { NextResponse } from "next/server";
import { getOrderByNumber, updatePaymentStatus, updateOrderStatus } from "@/lib/services/orders";
import { validateSslcommerzPayment } from "@/lib/payments/sslcommerz";

/**
 * SSLCommerz redirect + IPN handler.
 * `val_id` from the redirect is validated against the SSLCommerz validation API before
 * the order is marked paid; a browser redirect alone is never trusted.
 */
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  const form = await request.formData().catch(() => null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const tranId = String(form?.get("tran_id") ?? "");
  const valId = String(form?.get("val_id") ?? "");
  const order = tranId ? await getOrderByNumber(tranId) : null;

  if (!order) {
    return NextResponse.redirect(`${siteUrl}/track-order?error=unknown-order`, { status: 303 });
  }

  if (action === "success" || action === "ipn") {
    const validation = await validateSslcommerzPayment(valId);
    const amountMatches =
      validation.ok &&
      typeof validation.amount === "number" &&
      Math.round(validation.amount) === Math.round(order.total);

    if (amountMatches) {
      await updatePaymentStatus(String(order._id), "paid", "sslcommerz");
      if (order.status === "pending") {
        await updateOrderStatus(String(order._id), "confirmed", "Payment verified by SSLCommerz", "sslcommerz");
      }
      if (action === "ipn") return NextResponse.json({ ok: true });
      return NextResponse.redirect(`${siteUrl}/order-success?order=${order.orderNumber}`, { status: 303 });
    }

    await updatePaymentStatus(String(order._id), "failed", "sslcommerz");
    if (action === "ipn") return NextResponse.json({ ok: false, reason: validation.error }, { status: 400 });
    return NextResponse.redirect(`${siteUrl}/track-order?order=${order.orderNumber}&error=payment-failed`, { status: 303 });
  }

  if (action === "fail" || action === "cancel") {
    await updatePaymentStatus(String(order._id), "failed", "sslcommerz");
    return NextResponse.redirect(`${siteUrl}/track-order?order=${order.orderNumber}&error=payment-${action}`, { status: 303 });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 404 });
}

export async function GET(_request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (action === "ipn") return NextResponse.json({ ok: true, message: "IPN endpoint ready" });
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/track-order`, { status: 303 });
}
