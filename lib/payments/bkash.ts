import "server-only";
import type { OrderDoc, PaymentMethodDoc } from "@/lib/db/types";
import { gatewayCredentials } from "@/lib/services/payment-methods";

/**
 * bKash Tokenized Checkout (PGW v1.2.0).
 *
 * Flow: grant token → create payment → customer approves in bKash → callback →
 * execute payment (this is what actually confirms the money) → order marked paid.
 * Nothing is trusted from the browser: the order is only marked paid after `execute`
 * returns `transactionStatus: "Completed"` with the matching amount.
 *
 * Keys come from the payment method saved in the admin panel, falling back to
 * BKASH_APP_KEY / BKASH_APP_SECRET / BKASH_USERNAME / BKASH_PASSWORD in .env.local.
 */

const SANDBOX_BASE = "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const LIVE_BASE = "https://tokenized.pay.bka.sh/v1.2.0-beta";

function baseUrl(sandbox: boolean) {
  return process.env.BKASH_BASE_URL || (sandbox ? SANDBOX_BASE : LIVE_BASE);
}

export function isBkashConfigured(method?: PaymentMethodDoc | null): boolean {
  const credentials = gatewayCredentials(method ?? null);
  return Boolean(credentials.appKey && credentials.appSecret && credentials.username && credentials.password);
}

interface Credentials {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  sandbox: boolean;
}

async function grantToken(credentials: Credentials): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  try {
    const response = await fetch(`${baseUrl(credentials.sandbox)}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        username: credentials.username,
        password: credentials.password,
      },
      body: JSON.stringify({ app_key: credentials.appKey, app_secret: credentials.appSecret }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as { id_token?: string; statusMessage?: string; errorMessage?: string };
    if (!response.ok || !data.id_token) {
      return { ok: false, error: data.errorMessage || data.statusMessage || `bKash token request failed (${response.status})` };
    }
    return { ok: true, token: data.id_token };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/** Creates the payment and returns the URL the customer must be sent to. */
export async function createBkashPayment(
  order: OrderDoc,
  method: PaymentMethodDoc
): Promise<{ ok: boolean; url?: string; paymentId?: string; error?: string }> {
  const credentials = gatewayCredentials(method);
  if (!isBkashConfigured(method)) {
    return { ok: false, error: "bKash is not configured yet — add the app key, secret, username and password." };
  }

  const token = await grantToken(credentials);
  if (!token.ok) return { ok: false, error: token.error };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl(credentials.sandbox)}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: token.token,
        "x-app-key": credentials.appKey,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: order.customer.phone,
        callbackURL: `${siteUrl}/api/payments/bkash/callback`,
        amount: String(Math.round(order.total)),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: order.orderNumber,
      }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as {
      bkashURL?: string;
      paymentID?: string;
      statusMessage?: string;
      errorMessage?: string;
    };
    if (!response.ok || !data.bkashURL || !data.paymentID) {
      return { ok: false, error: data.errorMessage || data.statusMessage || "bKash could not start the payment." };
    }
    return { ok: true, url: data.bkashURL, paymentId: data.paymentID };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/** Confirms the payment. Only a completed execute with a matching amount counts as paid. */
export async function executeBkashPayment(
  paymentId: string,
  method: PaymentMethodDoc,
  expectedAmount: number
): Promise<{ ok: boolean; trxId?: string; amount?: number; error?: string }> {
  const credentials = gatewayCredentials(method);
  if (!isBkashConfigured(method)) return { ok: false, error: "bKash is not configured." };

  const token = await grantToken(credentials);
  if (!token.ok) return { ok: false, error: token.error };

  try {
    const response = await fetch(`${baseUrl(credentials.sandbox)}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: token.token,
        "x-app-key": credentials.appKey,
      },
      body: JSON.stringify({ paymentID: paymentId }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as {
      transactionStatus?: string;
      trxID?: string;
      amount?: string;
      statusMessage?: string;
      errorMessage?: string;
    };

    if (!response.ok || data.transactionStatus !== "Completed") {
      return { ok: false, error: data.errorMessage || data.statusMessage || "Payment was not completed." };
    }

    const amount = Number(data.amount ?? 0);
    if (Number.isFinite(amount) && Math.round(amount) !== Math.round(expectedAmount)) {
      return { ok: false, error: `Amount mismatch: bKash reported ${amount}, order is ${expectedAmount}.` };
    }

    return { ok: true, trxId: data.trxID, amount };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
