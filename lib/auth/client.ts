"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./server";

/**
 * The browser talks to whatever origin the page was opened on — localhost,
 * 127.0.0.1, a LAN IP from a phone, a port other than 3000, or a preview URL.
 *
 * Pinning `baseURL` to NEXT_PUBLIC_SITE_URL made every one of those cases send the
 * sign-in request to a different origin than the page, which either triggered a
 * CORS failure or a `403 Invalid origin` from the auth server — the symptom being
 * "login and signup do nothing". Leaving it undefined in the browser makes Better
 * Auth use same-origin requests, which always work.
 */
export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL || undefined : undefined,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Turns Better Auth / network failures into something a shop owner can act on.
 * Returns a message plus an optional hint shown under it.
 */
export function authErrorMessage(error: { message?: string; code?: string; status?: number }): {
  message: string;
  hint?: string;
} {
  const code = error.code ?? "";
  const status = error.status;

  if (code === "INVALID_ORIGIN" || /invalid origin/i.test(error.message ?? "")) {
    return {
      message: "Sign-in blocked: this address is not trusted by the server.",
      hint: "Open the site on its configured URL (http://localhost:3000) or set BETTER_AUTH_URL / NEXT_PUBLIC_SITE_URL to the address you are using, then restart npm run dev.",
    };
  }
  if (status === 401 || code === "INVALID_EMAIL_OR_PASSWORD") {
    return {
      message: "Wrong email or password.",
      // In development the usual cause is a database whose demo accounts were seeded
      // with a different password — point at the one-command repair.
      hint:
        process.env.NODE_ENV !== "production"
          ? "Setting this project up? Run `npm run doctor` in the terminal — it shows exactly what is wrong and what to run. `npm run seed:users` resets the demo passwords (admin@labonno.com / Labonno@2026) and prints them."
          : undefined,
    };
  }
  if (status === 403) {
    return { message: error.message ?? "This account is not allowed to sign in here." };
  }
  if (status === 429) {
    return { message: "Too many attempts. Please wait a minute and try again." };
  }
  if (status === 0 || /failed to fetch|networkerror|load failed/i.test(error.message ?? "")) {
    return {
      message: "Could not reach the auth server.",
      hint: "Usually the dev server stopped, or the auth URL points somewhere else. Open /api/health to check.",
    };
  }
  return { message: error.message ?? "Could not sign you in." };
}
