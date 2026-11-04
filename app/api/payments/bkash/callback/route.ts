import { NextResponse } from "next/server";
import { col } from "@/lib/db/mongo";
import { getOrderById, updatePaymentStatus, updateOrderStatus } from "@/lib/services/orders";
import { getPaymentMethod } from "@/lib/services/payment-methods";
import { executeBkashPayment } from "@/lib/payments/bkash";
import type { OrderDoc } from "@/lib/db/types";

/**
 * bKash sends the customer back here with ?paymentID=…&status=…
 * The query string is never trusted: the payment is executed server-to-server and only a
 * completed execute with the right amount marks the order paid.
 */
export async function GET(request: Request) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const params = new URL(request.url).searchParams;
  const paymentId = params.get("paymentID") ?? params.get("paymentId") ?? "";
  const status = (params.get("status") ?? "").toLowerCase();

  // We stored the bKash payment id on the order when the payment was created.
  const order = paymentId
    ? await col<OrderDoc>("orders").findOne({ "paymentRef.gatewayRef": paymentId })
    : null;

  if (status === "cancel" || status === "failure") {
    if (order) await updatePaymentStatus(String(order._id), "failed", "bkash");
    return NextResponse.redirect(
      `${siteUrl}/track-order?${order ? `order=${order.orderNumber}&` : ""}error=payment-${status}`,
      { status: 303 }
    );
  }

  if (!paymentId || !order) {
    return NextResponse.redirect(`${siteUrl}/track-order?error=unknown-payment`, { status: 303 });
  }

  const method = await getPaymentMethod(order.paymentMethod);
  if (!method) {
    return NextResponse.redirect(`${siteUrl}/track-order?order=${order.orderNumber}&error=payment-unavailable`, { status: 303 });
  }

  const result = await executeBkashPayment(paymentId, method, order.total);

  if (result.ok) {
    await updatePaymentStatus(String(order._id), "paid", "bkash", {
      provider: "bkash",
      transactionId: result.trxId,
      gatewayRef: paymentId,
      paidAt: new Date(),
    });
    if (order.status === "pending") {
      await updateOrderStatus(String(order._id), "confirmed", "Payment verified by bKash", "bkash");
    }
    return NextResponse.redirect(`${siteUrl}/order-success?order=${order.orderNumber}`, { status: 303 });
  }

  await updatePaymentStatus(String(order._id), "failed", "bkash");
  void getOrderById; // keep the import honest if the flow changes
  return NextResponse.redirect(`${siteUrl}/track-order?order=${order.orderNumber}&error=payment-failed`, { status: 303 });
}

export async function POST(request: Request) {
  // bKash only uses GET redirects, but POST is accepted for local testing.
  return GET(request);
}
