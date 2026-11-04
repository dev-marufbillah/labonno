import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { mongoClient } from "@/lib/db/mongo";
import { isOwnerEmail, normaliseEmail } from "./owners";

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const stripSlash = (value: string) => value.replace(/\/+$/, "");

/** Localhost, 127.0.0.1, [::1] and private LAN addresses — dev/mobile testing. */
function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]") return true;
    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Origins Better Auth will accept sign-in requests from.
 *
 * Production: strictly the configured site URLs (plus their www variant).
 * Development: any local/LAN origin is also accepted, because it is completely
 * normal to open the app on http://127.0.0.1:3000, on port 3001 when 3000 is busy,
 * or from a phone on the LAN — all of which previously failed with
 * `403 Invalid origin` and looked like "login is broken".
 */
export function trustedOriginList(requestOrigin?: string | null): string[] {
  const configured = [process.env.BETTER_AUTH_URL, process.env.NEXT_PUBLIC_SITE_URL]
    .filter((value): value is string => Boolean(value))
    .map(stripSlash);

  const origins = new Set<string>(configured.length ? configured : ["http://localhost:3000"]);

  for (const url of [...origins]) {
    try {
      const { protocol, hostname } = new URL(url);
      if (!hostname.startsWith("www.") && hostname.includes(".")) origins.add(`${protocol}//www.${hostname}`);
    } catch {
      /* ignore malformed values */
    }
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  if (requestOrigin && isLocalOrigin(requestOrigin) && process.env.NODE_ENV !== "production") {
    origins.add(stripSlash(requestOrigin));
  }

  return [...origins];
}

/**
 * Whether the Mongo deployment can run multi-document transactions.
 *
 * Better Auth writes the `user` row and the credential `account` row inside one
 * transaction when it is handed the Mongo client. Transactions only exist on a
 * replica set or mongos — a plain local `mongod` (the default Windows install)
 * answers with "Transaction numbers are only allowed on a replica set member or
 * mongos", and every sign-up or seeded account fails with that message.
 *
 * So the client is only passed when the URI says transactions are available
 * (Atlas, `replicaSet=…`, or mongos). `MONGODB_TRANSACTIONS=true|false` overrides
 * the guess — useful for a local single-node replica set.
 */
export function mongoTransactionsEnabled(): boolean {
  const override = process.env.MONGODB_TRANSACTIONS?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  const uri = process.env.MONGODB_URI ?? "";
  return /mongodb\+srv:|[?&]replicaSet=|mongos/i.test(uri);
}

/** True when the browser origin is allowed to call the auth endpoints. */
export function isTrustedOrigin(origin?: string | null): boolean {
  if (!origin) return true;
  return trustedOriginList(origin).includes(stripSlash(origin));
}

/**
 * Shared Better Auth options. Kept in one place so the Next.js runtime, the seed
 * script and future workers all authenticate against identical rules.
 */
export function createAuth(options: { withNextCookies?: boolean; disableRateLimit?: boolean } = {}) {
  const { withNextCookies = true, disableRateLimit = false } = options;

  return betterAuth({
    appName: "LABONNO",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(
      mongoClient.db(process.env.MONGODB_DB || "labonno"),
      mongoTransactionsEnabled() ? { client: mongoClient } : {}
    ),
    /**
     * Owner addresses become super admins the moment the account is created, so the
     * founder never has to touch a database to get into the studio.
     */
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const email = normaliseEmail(String((user as { email?: string }).email ?? ""));
            if (email && (await isOwnerEmail(email))) {
              return { data: { ...(user as Record<string, unknown>), role: "super_admin" } };
            }
            return { data: user };
          },
        },
      },
    },
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
    // Seeding creates accounts in a loop; the sign-up limiter would silently drop
    // the last ones, which is how a seeded database ended up with products but zero
    // accounts. Scripts pass disableRateLimit: true.
    rateLimit: disableRateLimit
      ? { enabled: false }
      : {
          enabled: true,
          window: 60,
          max: 30,
          customRules: {
            "/sign-in/email": { window: 60, max: 8 },
            "/sign-up/email": { window: 60, max: 5 },
          },
        },
    trustedOrigins: (request) => {
      const header = request?.headers?.get("origin") ?? null;
      return trustedOriginList(header);
    },
    ...(withNextCookies ? { plugins: [nextCookies()] } : {}),
  });
}
