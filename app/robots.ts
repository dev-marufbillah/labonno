import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://labonno.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or transactional areas should never appear in search results.
        disallow: ["/admin", "/admin/", "/api/", "/account", "/account/", "/cart", "/checkout", "/wishlist", "/order-success", "/login", "/register"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
