import { NextResponse, type NextRequest } from "next/server";
import { decideRoute } from "@/lib/auth/routes";

/**
 * Edge middleware — the cheapest possible first gate.
 *
 * It only looks for the Better Auth session cookie and bounces anonymous visitors to
 * the right login screen, remembering where they were going (`?next=`). It deliberately
 * does NOT trust the cookie payload: the authoritative check (role included) runs again
 * in `lib/auth/server.ts` inside the /admin and /account layouts and in every server
 * action / API route, so a forged cookie still gets nowhere.
 *
 * The rules themselves live in `lib/auth/routes.ts` as a pure function — see
 * `npm run check:routes` — so this file stays trivial.
 */
const SESSION_COOKIES = ["labonno.session_token", "__Secure-labonno.session_token"];

function hasSessionCookie(request: NextRequest) {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = decideRoute({ pathname, search, signedIn: hasSessionCookie(request) });

  if (decision.action === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = decision.pathname;
    url.search = decision.search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Keep the matcher tight so static assets, images and API handlers are untouched.
  matcher: [
    "/admin",
    "/admin/((?!login).*)",
    "/account",
    "/account/:path*",
    "/cart",
    "/checkout",
    "/wishlist",
    "/order-success",
    "/login",
    "/register",
  ],
};
