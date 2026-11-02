import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { mongoClient } from "@/lib/db/mongo";

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/**
 * Shared Better Auth options. Kept in one place so the Next.js runtime, the seed
 * script and future workers all authenticate against identical rules.
 */
export function createAuth(options: { withNextCookies?: boolean } = {}) {
  const { withNextCookies = true } = options;

  return betterAuth({
    appName: "LABONNO",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(mongoClient.db(process.env.MONGODB_DB || "labonno"), { client: mongoClient }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    socialProviders: googleConfigured
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            prompt: "select_account",
          },
        }
      : {},
    user: {
      additionalFields: {
        role: { type: "string", required: false, defaultValue: "customer", input: false },
        phone: { type: "string", required: false, input: true },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    advanced: {
      cookiePrefix: "labonno",
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 8 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    trustedOrigins: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
    ...(withNextCookies ? { plugins: [nextCookies()] } : {}),
  });
}
