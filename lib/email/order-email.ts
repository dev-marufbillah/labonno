import "server-only";
import type { OrderDoc } from "@/lib/db/types";
import { getSiteSettings } from "@/lib/services/settings";
import { getPaymentLabel } from "@/lib/services/payment-methods";
import { sendMail, mailerConfigured } from "./mailer";
import { orderConfirmationEmail, orderStatusEmail } from "./templates";

/**
 * Sends the "we have your order" email. Never throws: a broken mail provider must not
 * cost the shop a sale, and the admin order page shows whether the mail went out.
 */
export async function sendOrderConfirmation(order: OrderDoc): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!mailerConfigured()) return { ok: false, skipped: true, error: "Email is not configured." };
  try {
    const [settings, paymentLabel] = await Promise.all([getSiteSettings(), getPaymentLabel(order.paymentMethod)]);
    const siteName = settings.general.brandName || "Labonno";
    return await sendMail({
      to: order.customer.email,
      subject: `Order ${order.orderNumber} confirmed — ${siteName}`,
      html: orderConfirmationEmail(order, siteName, paymentLabel),
      text: `Thank you for your order ${order.orderNumber}. Total ${order.total} BDT. We will confirm it shortly.`,
    });
  } catch (error) {
    console.error("order confirmation email failed", error);
    return { ok: false, error: (error as Error).message };
  }
}

export async function sendOrderStatusUpdate(order: OrderDoc, status: string): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!mailerConfigured()) return { ok: false, skipped: true };
  const copies: Record<string, { heading: string; message: string }> = {
    confirmed: {
      heading: "Your order is confirmed",
      message: "Our studio has confirmed your order and is preparing it with care.",
    },
    processing: {
      heading: "We are preparing your order",
      message: "Your pieces are being checked, steamed and wrapped by our studio team.",
    },
    shipped: {
      heading: "Your order is on its way",
      message: "Your parcel has left the studio. Our courier will call you before delivery.",
    },
    delivered: {
      heading: "Delivered — we hope you love it",
      message: "Your order has been delivered. If anything is not right, reply within 7 days for an exchange.",
    },
    cancelled: {
      heading: "Your order was cancelled",
      message: "Your order has been cancelled. If you did not ask for this, please reply and we will look into it.",
    },
  };
  const copy = copies[status];
  if (!copy) return { ok: true, skipped: true };
  try {
    const settings = await getSiteSettings();
    const siteName = settings.general.brandName || "Labonno";
    return await sendMail({
      to: order.customer.email,
      subject: `${copy.heading} — ${order.orderNumber}`,
      html: orderStatusEmail(order, copy.heading, copy.message, siteName),
    });
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
