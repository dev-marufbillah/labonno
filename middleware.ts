import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware.
 *
 * This is a cheap first gate only: it looks for the Better Auth session cookie and
 * bounces anonymous visitors to the right login screen before a server component
 * ever boots. It deliberately does NOT decode or trust the cookie payload — the
 * authoritative check (role included) happens in `lib/auth/server.ts` inside the
 * layouts of /admin and /account, and again in every server action.
 */
const SESSION_COOKIES = ["labonno.session_token", "__Secure-labonno.session_token"];

function hasSessionCookie(request: NextRequest) {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = hasSessionCookie(request);

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";
  const isAuthScreen = pathname === "/login" || pathname === "/register";

  if (isAdminArea && !isAdminLogin && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" || pathname === "/admin/dashboard" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isAuthScreen && signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Keep the matcher tight so static assets, images and API handlers are untouched.
  matcher: ["/admin", "/admin/((?!login).*)", "/account/:path*", "/login", "/register"],
};
