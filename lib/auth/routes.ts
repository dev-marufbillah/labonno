/**
 * Route-level access rules, kept as a pure function so they can be tested without a
 * server and so the middleware stays a two-line wrapper around them.
 *
 *   /admin/**            → staff only (studio login)
 *   /account/**          → signed-in customers only
 *   /cart, /checkout,
 *   /wishlist, /order-*  → signed-in customers only (the bag belongs to an account)
 *   /login, /register    → signed-in visitors are sent on to /account
 *   everything else      → public
 */
export const MEMBER_PREFIXES = ["/cart", "/checkout", "/wishlist", "/order-success"];

export function isAdminArea(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAdminLogin(pathname: string): boolean {
  return pathname === "/admin/login";
}

export function isAccountArea(pathname: string): boolean {
  return pathname === "/account" || pathname.startsWith("/account/");
}

export function isMemberArea(pathname: string): boolean {
  return MEMBER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAuthScreen(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

export type RouteDecision =
  | { action: "allow" }
  | { action: "redirect"; pathname: string; search: string };

function withNext(target: string, pathname: string, search: string): RouteDecision {
  return { action: "redirect", pathname: target, search: `?next=${encodeURIComponent(pathname + search)}` };
}

export function decideRoute({
  pathname,
  search = "",
  signedIn,
}: {
  pathname: string;
  search?: string;
  signedIn: boolean;
}): RouteDecision {
  if (isAdminArea(pathname) && !isAdminLogin(pathname) && !signedIn) {
    // The admin dashboard itself does not need a `next` — the studio login defaults to it.
    return pathname === "/admin" || pathname === "/admin/dashboard"
      ? { action: "redirect", pathname: "/admin/login", search: "" }
      : withNext("/admin/login", pathname, search);
  }

  if (isAccountArea(pathname) && !signedIn) return withNext("/login", pathname, search);
  if (isMemberArea(pathname) && !signedIn) return withNext("/login", pathname, search);

  if (isAuthScreen(pathname) && signedIn) return { action: "redirect", pathname: "/account", search: "" };

  return { action: "allow" };
}
