/**
 * Access-rule checks for the storefront proxy — `npm run check:routes`.
 *
 * No server needed: the same pure function the middleware calls is exercised against a
 * matrix of visitor states, so a regression in the guards fails here instead of leaking
 * a bag or an order page to a stranger.
 */
import { decideRoute } from "../lib/auth/routes";

interface Case {
  pathname: string;
  signedIn: boolean;
  expect: "allow" | { pathname: string; next?: string };
}

const cases: Case[] = [
  // Public storefront
  { pathname: "/", signedIn: false, expect: "allow" },
  { pathname: "/shop", signedIn: false, expect: "allow" },
  { pathname: "/products/kurta", signedIn: false, expect: "allow" },
  { pathname: "/track-order", signedIn: false, expect: "allow" },
  { pathname: "/login", signedIn: false, expect: "allow" },
  { pathname: "/register", signedIn: false, expect: "allow" },

  // Bag, checkout, wishlist, confirmation → sign in first
  { pathname: "/cart", signedIn: false, expect: { pathname: "/login", next: "/cart" } },
  { pathname: "/checkout", signedIn: false, expect: { pathname: "/login", next: "/checkout" } },
  { pathname: "/wishlist", signedIn: false, expect: { pathname: "/login", next: "/wishlist" } },
  { pathname: "/order-success", signedIn: false, expect: { pathname: "/login", next: "/order-success" } },

  // Account area (every sub-page, including the new ones)
  { pathname: "/account", signedIn: false, expect: { pathname: "/login", next: "/account" } },
  { pathname: "/account/orders", signedIn: false, expect: { pathname: "/login", next: "/account/orders" } },
  { pathname: "/account/addresses", signedIn: false, expect: { pathname: "/login", next: "/account/addresses" } },
  { pathname: "/account/reviews", signedIn: false, expect: { pathname: "/login", next: "/account/reviews" } },
  { pathname: "/account/profile", signedIn: false, expect: { pathname: "/login", next: "/account/profile" } },

  // Admin studio
  { pathname: "/admin", signedIn: false, expect: { pathname: "/admin/login" } },
  { pathname: "/admin/dashboard", signedIn: false, expect: { pathname: "/admin/login" } },
  { pathname: "/admin/products", signedIn: false, expect: { pathname: "/admin/login", next: "/admin/products" } },
  { pathname: "/admin/login", signedIn: false, expect: "allow" },

  // Signed in: everything above is allowed, auth screens bounce to the account page
  { pathname: "/cart", signedIn: true, expect: "allow" },
  { pathname: "/checkout", signedIn: true, expect: "allow" },
  { pathname: "/wishlist", signedIn: true, expect: "allow" },
  { pathname: "/account", signedIn: true, expect: "allow" },
  { pathname: "/account/addresses", signedIn: true, expect: "allow" },
  { pathname: "/admin/products", signedIn: true, expect: "allow" },
  { pathname: "/login", signedIn: true, expect: { pathname: "/account" } },
  { pathname: "/register", signedIn: true, expect: { pathname: "/account" } },
];

let failures = 0;

for (const testCase of cases) {
  const decision = decideRoute({ pathname: testCase.pathname, signedIn: testCase.signedIn });
  const state = testCase.signedIn ? "signed-in" : "guest";

  if (testCase.expect === "allow") {
    if (decision.action !== "allow") {
      failures += 1;
      console.log(`  ✖ ${testCase.pathname} (${state}) should be public but redirects to ${decision.pathname}`);
    } else {
      console.log(`  ✓ ${testCase.pathname} (${state}) → allowed`);
    }
    continue;
  }

  const expectedNext = testCase.expect.next ? `?next=${encodeURIComponent(testCase.expect.next)}` : "";
  const actual = decision.action === "redirect" ? `${decision.pathname}${decision.search}` : "allowed";
  const expected = `${testCase.expect.pathname}${expectedNext}`;

  if (actual !== expected) {
    failures += 1;
    console.log(`  ✖ ${testCase.pathname} (${state}) → ${actual}, expected ${expected}`);
  } else {
    console.log(`  ✓ ${testCase.pathname} (${state}) → ${actual}`);
  }
}

console.log(`\n${cases.length - failures} passed, ${failures} failed`);
process.exitCode = failures === 0 ? 0 : 1;
