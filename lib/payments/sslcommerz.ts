import "server-only";
import { SITE } from "@/lib/config/site";
import type { OrderDoc } from "@/lib/db/types";

/**
 * SSLCommerz hosted checkout.
 * Requires SSLCOMMERZ_STORE_ID + SSLCOMMERZ_STORE_PASSWORD. All verification happens
 * server-side against the SSLCommerz validation API — a redirect alone never marks an
 * order paid.
 */
export function sslcommerzConfigured(): boolean {
  return Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD);
}

function baseUrl() {
  return process.env.SSLCOMMERZ_SANDBOX === "false"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
}

export async function createSslcommerzSession(order: OrderDoc): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!sslcommerzConfigured()) {
    return { ok: false, error: "Card payments are not configured yet. Please choose cash on delivery, bKash or Nagad." };
  }
  const storeId = process.env.SSLCOMMERZ_STORE_ID as string;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: String(order.total),
    currency: "BDT",
    tran_id: order.orderNumber,
    success_url: `${siteUrl}/api/payments/sslcommerz/success`,
    fail_url: `${siteUrl}/api/payments/sslcommerz/fail`,
    cancel_url: `${siteUrl}/api/payments/sslcommerz/cancel`,
    ipn_url: `${siteUrl}/api/payments/sslcommerz/ipn`,
    cus_name: order.customer.name,
    cus_email: order.customer.email,
    cus_add1: order.shippingAddress.address,
    cus_city: order.shippingAddress.district,
    cus_postcode: order.shippingAddress.postcode || "1000",
    cus_country: "Bangladesh",
    cus_phone: order.customer.phone,
    shipping_method: "Courier",
    num_of_item: String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
    product_name: order.items.map((item) => item.name).join(", ").slice(0, 250),
    product_category: "Fashion",
    product_profile: "general",
  });

  try {
    const res = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };
    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      return { ok: false, error: data.failedreason || "SSLCommerz session could not be created." };
    }
    return { ok: true, url: data.GatewayPageURL };
  } catch {
    return { ok: false, error: "Could not reach SSLCommerz. Please choose another payment method." };
  }
}

export async function validateSslcommerzPayment(valId: string): Promise<{ ok: boolean; amount?: number; tranId?: string; error?: string }> {
  if (!sslcommerzConfigured() || !valId) return { ok: false, error: "SSLCommerz is not configured." };
  const storeId = process.env.SSLCOMMERZ_STORE_ID as string;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD as string;
  const url = `${baseUrl()}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(
    valId
  )}&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(storePassword)}&format=json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as { status?: string; amount?: string; tran_id?: string; currency?: string };
    if (data.status !== "VALID" && data.status !== "VALIDATED") {
      return { ok: false, error: "Payment could not be validated." };
    }
    if (data.currency && data.currency !== "BDT") return { ok: false, error: "Unexpected currency." };
    return { ok: true, amount: Number(data.amount), tranId: data.tran_id };
  } catch {
    return { ok: false, error: "Validation request failed." };
  }
}
