/**
 * One place that answers "is this service switched on?" — used by the admin panel and
 * by `npm run check:env`. It only ever reports presence, never the value of a secret.
 */

export type IntegrationState = "on" | "manual" | "off";

export interface Integration {
  key: string;
  name: string;
  state: IntegrationState;
  detail: string;
  env: string;
  docs?: string;
}

const has = (value?: string | null) => Boolean(value && value.trim());
const placeholder = (value?: string | null) =>
  !value || /replace-|your-|example|changeme|xxx/i.test(value);

export function integrations(): Integration[] {
  const cloudinary = has(process.env.CLOUDINARY_CLOUD_NAME) && has(process.env.CLOUDINARY_API_KEY) && has(process.env.CLOUDINARY_API_SECRET);
  const cloudinaryUrl = has(process.env.CLOUDINARY_URL);
  const resend = has(process.env.RESEND_API_KEY) && has(process.env.EMAIL_FROM);
  const bkash = has(process.env.BKASH_APP_KEY) && has(process.env.BKASH_APP_SECRET) && has(process.env.BKASH_USERNAME) && has(process.env.BKASH_PASSWORD);
  const ssl = has(process.env.SSLCOMMERZ_STORE_ID) && has(process.env.SSLCOMMERZ_STORE_PASSWORD);
  const nagad = has(process.env.NAGAD_MERCHANT_ID) && has(process.env.NAGAD_MERCHANT_PRIVATE_KEY);
  const google = has(process.env.GOOGLE_CLIENT_ID) && has(process.env.GOOGLE_CLIENT_SECRET);
  const ga = has(process.env.NEXT_PUBLIC_GA_ID);
  const pixel = has(process.env.NEXT_PUBLIC_META_PIXEL_ID);

  return [
    {
      key: "mongo",
      name: "MongoDB (database)",
      state: has(process.env.MONGODB_URI) ? "on" : "off",
      detail: has(process.env.MONGODB_URI)
        ? `${String(process.env.MONGODB_URI).includes("mongodb+srv") ? "Atlas" : "local"} · db "${process.env.MONGODB_DB || "labonno"}"`
        : "Nothing can load without it.",
      env: "MONGODB_URI",
      docs: "https://www.mongodb.com/cloud/atlas/register",
    },
    {
      key: "auth",
      name: "Login & sessions",
      state: has(process.env.BETTER_AUTH_SECRET) && !placeholder(process.env.BETTER_AUTH_SECRET) ? "on" : "off",
      detail:
        has(process.env.BETTER_AUTH_SECRET) && !placeholder(process.env.BETTER_AUTH_SECRET)
          ? "Secret set — logins are signed."
          : "Set BETTER_AUTH_SECRET (npm run setup generates one).",
      env: "BETTER_AUTH_SECRET",
    },
    {
      key: "cloudinary",
      name: "Cloudinary (images)",
      state: cloudinary || cloudinaryUrl ? "on" : "manual",
      detail:
        cloudinary || cloudinaryUrl
          ? "Uploads go to Cloudinary and are served from its CDN."
          : "Not set — uploads are saved to /public/uploads (development only).",
      env: "CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET (or CLOUDINARY_URL)",
      docs: "https://console.cloudinary.com/settings/api-keys",
    },
    {
      key: "resend",
      name: "Order emails (Resend)",
      state: resend ? "on" : "off",
      detail: resend ? "Confirmation + status emails are sent." : "Not set — orders still work, no email goes out.",
      env: "RESEND_API_KEY + EMAIL_FROM",
      docs: "https://resend.com/api-keys",
    },
    {
      key: "bkash",
      name: "bKash checkout (automatic)",
      state: bkash ? "on" : "manual",
      detail: bkash
        ? `Live with ${process.env.BKASH_SANDBOX === "false" ? "production" : "sandbox"} credentials.`
        : "Not set — bKash still works as a manual payment (send money + TrxID).",
      env: "BKASH_APP_KEY / BKASH_APP_SECRET / BKASH_USERNAME / BKASH_PASSWORD",
      docs: "https://developer.bka.sh",
    },
    {
      key: "sslcommerz",
      name: "Card payments (SSLCommerz)",
      state: ssl ? "on" : "off",
      detail: ssl ? "Card checkout is available." : "Not set — the card option stays hidden.",
      env: "SSLCOMMERZ_STORE_ID + SSLCOMMERZ_STORE_PASSWORD",
      docs: "https://developer.sslcommerz.com",
    },
    {
      key: "nagad",
      name: "Nagad",
      state: nagad ? "on" : "manual",
      detail: nagad ? "Nagad credentials present." : "Not set — Nagad works as a manual payment.",
      env: "NAGAD_MERCHANT_ID + NAGAD_MERCHANT_PRIVATE_KEY",
      docs: "https://developer.mynagad.com",
    },
    {
      key: "google",
      name: "Google sign-in",
      state: google ? "on" : "off",
      detail: google ? "The Google button is shown on the login screens." : "Not set — the button is hidden.",
      env: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
      docs: "https://console.cloud.google.com/apis/credentials",
    },
    {
      key: "analytics",
      name: "Analytics",
      state: ga || pixel ? "on" : "off",
      detail: [ga ? "Google Analytics" : null, pixel ? "Meta Pixel" : null].filter(Boolean).join(" + ") || "Nothing loads.",
      env: "NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_META_PIXEL_ID",
      docs: "https://analytics.google.com",
    },
  ];
}

/** A short "3 of 9 services connected" line for the dashboard. */
export function integrationSummary() {
  const list = integrations();
  return { total: list.length, on: list.filter((item) => item.state === "on").length, list };
}
