import "server-only";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import { cachedRead, TTL } from "./cache";
import type { PaymentMethodDoc } from "@/lib/db/types";

type Seed = Omit<PaymentMethodDoc, "_id" | "createdAt" | "updatedAt">;

/**
 * Imported the first time the shop runs, so a fresh install never has zero ways to pay.
 * After that the collection is the single source of truth and the owner edits it in
 * Admin → Settings → Payment methods.
 */
const DEFAULTS: Seed[] = [
  {
    key: "cod",
    label: "Cash on delivery",
    kind: "manual",
    enabled: true,
    order: 1,
    description: "Pay the courier when your order arrives.",
    instructions: "Pay in cash when your order is delivered. Available nationwide.",
    requiresReference: false,
    gateway: null,
    badge: "Most popular",
  },
  {
    key: "bkash",
    label: "bKash",
    kind: "manual",
    enabled: true,
    order: 2,
    description: "Send money to our bKash merchant number.",
    instructions:
      "Send the total to our bKash number, then enter the number you paid from and the transaction ID. We verify every payment before dispatch.",
    number: "01711 000 000",
    accountType: "Merchant",
    requiresReference: true,
    gateway: null,
  },
  {
    key: "nagad",
    label: "Nagad",
    kind: "manual",
    enabled: true,
    order: 3,
    description: "Send money to our Nagad merchant number.",
    instructions:
      "Send the total to our Nagad number, then enter the number you paid from and the transaction ID.",
    number: "01711 000 000",
    accountType: "Merchant",
    requiresReference: true,
    gateway: null,
  },
  {
    key: "sslcommerz",
    label: "Card / mobile banking (SSLCommerz)",
    kind: "gateway",
    enabled: true,
    order: 4,
    description: "Visa, Mastercard, bKash, Nagad and internet banking in one secure window.",
    instructions: "Card and mobile banking payments are processed securely through SSLCommerz.",
    requiresReference: false,
    gateway: "sslcommerz",
  },
];

async function readPaymentMethods(): Promise<PaymentMethodDoc[]> {
  const collection = col<PaymentMethodDoc>("payment_methods");
  const docs = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
  if (docs.length > 0) return docs;

  const now = new Date();
  await collection.insertMany(DEFAULTS.map((method) => ({ ...method, createdAt: now, updatedAt: now })));
  return collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
}

/** Every method, enabled or not — used by the admin panel and by checkout labels. */
export const listPaymentMethods = cachedRead("payment-methods", TTL.settings, readPaymentMethods);

export async function getEnabledPaymentMethods(): Promise<PaymentMethodDoc[]> {
  return (await listPaymentMethods()).filter((method) => method.enabled);
}

export async function getPaymentMethod(key: string): Promise<PaymentMethodDoc | null> {
  return (await listPaymentMethods()).find((method) => method.key === key) ?? null;
}

/** Label for an order's stored payment key, with the key itself as the last resort. */
export async function getPaymentLabel(key: string): Promise<string> {
  return (await getPaymentMethod(key))?.label ?? key;
}

export async function getPaymentLabels(): Promise<Record<string, string>> {
  const methods = await listPaymentMethods();
  return Object.fromEntries(methods.map((method) => [method.key, method.label]));
}

/** Gateway credentials: the method's own settings win, environment is the fallback. */
export function gatewayCredentials(method: PaymentMethodDoc | null) {
  const config = method?.config ?? {};
  return {
    appKey: config.appKey || process.env.BKASH_APP_KEY || "",
    appSecret: config.appSecret || process.env.BKASH_APP_SECRET || "",
    username: config.username || process.env.BKASH_USERNAME || "",
    password: config.password || process.env.BKASH_PASSWORD || "",
    storeId: config.storeId || process.env.SSLCOMMERZ_STORE_ID || "",
    storePassword: config.storePassword || process.env.SSLCOMMERZ_STORE_PASSWORD || "",
    sandbox: config.sandbox ?? process.env.BKASH_SANDBOX !== "false",
  };
}

export function isPaymentMethodId(id: string): boolean {
  return ObjectId.isValid(id);
}
