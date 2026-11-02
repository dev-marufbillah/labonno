import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api/", "/checkout", "/cart", "/order-success", "/wishlist"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
