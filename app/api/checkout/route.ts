import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkoutSchema } from "@/lib/validations";
import { getSiteSettings, shippingChargeFor } from "@/lib/services/settings";
import { createOrder, OrderError } from "@/lib/services/orders";
import { getCurrentUser } from "@/lib/auth/server";
import { createSslcommerzSession } from "@/lib/payments/sslcommerz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check your details", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);
    const input = parsed.data;

    if (!settings.payments[input.paymentMethod]?.enabled) {
      return NextResponse.json({ error: "That payment method is currently unavailable." }, { status: 400 });
    }

    if (
      (input.paymentMethod === "bkash" || input.paymentMethod === "nagad") &&
      (!input.paymentReference?.transactionId || !input.paymentReference?.senderNumber)
    ) {
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
      userId: user?.id ?? null,
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

    if (input.paymentMethod === "sslcommerz") {
      const session = await createSslcommerzSession(order);
      if (session.ok && session.url) {
        return NextResponse.json({ orderNumber: order.orderNumber, redirectUrl: session.url });
      }
      return NextResponse.json(
        { error: session.error ?? "Card payment could not be started.", orderNumber: order.orderNumber },
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
