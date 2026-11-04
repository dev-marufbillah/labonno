import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkoutSchema } from "@/lib/validations";
import { getSiteSettings, shippingChargeFor } from "@/lib/services/settings";
import { createOrder, OrderError } from "@/lib/services/orders";
import { requireApiUser } from "@/lib/auth/guards";
import { createSslcommerzSession } from "@/lib/payments/sslcommerz";
import { createBkashPayment } from "@/lib/payments/bkash";
import { getEnabledPaymentMethods } from "@/lib/services/payment-methods";
import { updatePaymentStatus } from "@/lib/services/orders";
import { sendOrderConfirmation } from "@/lib/email/order-email";

export async function POST(request: Request) {
  try {
    // Checkout is for signed-in customers only — an order must always have an owner.
    const { user, error } = await requireApiUser("/checkout");
    if (error || !user) return error!;

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check your details", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const settings = await getSiteSettings();
    const input = parsed.data;

    // Whatever the owner has switched on in Admin → Payment methods is what we accept.
    const enabledMethods = await getEnabledPaymentMethods();
    const method = enabledMethods.find((candidate) => candidate.key === input.paymentMethod);
    if (!method) {
      return NextResponse.json({ error: "That payment method is currently unavailable." }, { status: 400 });
    }

    if (method.requiresReference && (!input.paymentReference?.transactionId || !input.paymentReference?.senderNumber)) {
      return NextResponse.json(
        { error: "Enter the number you paid from and the transaction ID so we can verify your payment." },
        { status: 422 }
      );
    }

    const order = await createOrder({
      items: input.items,
      customer: input.customer,
      shippingAddress: {
        address: input.shippingAddress.address,
        area: input.shippingAddress.area,
        district: input.shippingAddress.district,
        postcode: input.shippingAddress.postcode || "",
        note: input.shippingAddress.note || "",
      },
      paymentMethod: input.paymentMethod,
      couponCode: input.couponCode || null,
      paymentReference: input.paymentReference ?? null,
      userId: user.id,
      deliveryCharge: shippingChargeFor(input.shippingAddress.district, settings),
      settings,
    });

    const cookieStore = await cookies();
    cookieStore.set("labonno_last_order", order.orderNumber, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // Confirmation email — best effort, never blocks the order.
    void sendOrderConfirmation(order).catch(() => {});

    if (method.gateway === "sslcommerz") {
      const session = await createSslcommerzSession(order);
      if (session.ok && session.url) {
        return NextResponse.json({ orderNumber: order.orderNumber, redirectUrl: session.url });
      }
      return NextResponse.json(
        { error: session.error ?? "Card payment could not be started.", orderNumber: order.orderNumber },
        { status: 400 }
      );
    }

    if (method.gateway === "bkash") {
      const payment = await createBkashPayment(order, method);
      if (payment.ok && payment.url) {
        // Remember the bKash payment id so the callback can find this order again.
        await updatePaymentStatus(String(order._id), order.paymentStatus, "bkash", {
          provider: "bkash",
          gatewayRef: payment.paymentId,
        });
        return NextResponse.json({ orderNumber: order.orderNumber, redirectUrl: payment.url });
      }
      return NextResponse.json(
        { error: payment.error ?? "bKash payment could not be started.", orderNumber: order.orderNumber },
        { status: 400 }
      );
    }

    return NextResponse.json({ orderNumber: order.orderNumber, total: order.total }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("checkout failed", error);
    return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
  }
}
