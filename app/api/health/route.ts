import { NextResponse } from "next/server";
import { col } from "@/lib/db/mongo";
import { isTrustedOrigin, trustedOriginList } from "@/lib/auth/core";

export const dynamic = "force-dynamic";

/**
 * One-click diagnostics for "login does not work" / "nothing shows up" reports.
 *
 * Open http://localhost:3000/api/health in the same browser you are testing with.
 * It reports whether this exact origin is trusted, whether the database answers,
 * how many accounts exist and what to do next. No secret value is ever returned —
 * only booleans and counts.
 */
/** The origin the browser is actually on (Origin header on fetch, Host on navigation). */
function browserOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return new URL(request.url).origin;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (/^(localhost|127\.|\[::1\]|10\.|192\.168\.)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const requestOrigin = browserOrigin(request);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || null;
  const authUrl = process.env.BETTER_AUTH_URL || null;

  const warnings: string[] = [];
  const report: Record<string, unknown> = {
    ok: true,
    checkedAt: new Date().toISOString(),
    origin: {
      request: requestOrigin,
      trusted: isTrustedOrigin(requestOrigin),
      expected: siteUrl ?? "http://localhost:3000",
      accepted: trustedOriginList(requestOrigin),
    },
    env: {
      MONGODB_URI: Boolean(process.env.MONGODB_URI),
      MONGODB_DB: process.env.MONGODB_DB || "labonno",
      BETTER_AUTH_SECRET: Boolean(process.env.BETTER_AUTH_SECRET),
      BETTER_AUTH_URL: authUrl,
      NEXT_PUBLIC_SITE_URL: siteUrl,
      CLOUDINARY: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
      ),
      GOOGLE: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      SSLCOMMERZ: Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD),
    },
    database: { connected: false as boolean },
    accounts: {} as Record<string, string>,
  };

  if (!process.env.BETTER_AUTH_SECRET) {
    warnings.push("BETTER_AUTH_SECRET is empty — sign-in cannot work. Run `npm run setup` or add a secret to .env.local, then restart the server.");
  }
  if (!isTrustedOrigin(requestOrigin)) {
    warnings.push(
      `Sign-in would be rejected from ${requestOrigin} (403 Invalid origin). Open the site on ${siteUrl ?? "http://localhost:3000"}, or set BETTER_AUTH_URL / NEXT_PUBLIC_SITE_URL to ${requestOrigin} and restart the server.`
    );
  }

  try {
    const [products, users, admins, orders] = await Promise.all([
      col("products").countDocuments(),
      col("user").countDocuments(),
      col("user").countDocuments({ role: { $in: ["admin", "super_admin"] } }),
      col("orders").countDocuments(),
    ]);

    const adminDocs = await col("user")
      .find({ role: { $in: ["admin", "super_admin"] } })
      .project({ email: 1, role: 1 })
      .limit(10)
      .toArray();

    report.database = { connected: true, products, users, admins, orders };
    report.accounts = Object.fromEntries(adminDocs.map((doc) => [String(doc.email), String(doc.role)]));

    if (users === 0) {
      warnings.push("The database has no accounts yet. Run `npm run seed` to create the demo admin (admin@labonno.com / Labonno@2026).");
    } else if (admins === 0) {
      warnings.push("No admin account exists. Run `npm run seed`, or promote a user from Settings ▸ Admin users.");
    }
  } catch (error) {
    report.database = { connected: false, error: error instanceof Error ? error.message : "Unknown error" };
    warnings.push("Could not reach MongoDB. Check MONGODB_URI in .env.local and that the cluster's IP access list allows your address.");
  }

  report.warnings = warnings;
  report.ok = warnings.length === 0;

  return NextResponse.json(report, { headers: { "cache-control": "no-store" } });
}
