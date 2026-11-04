import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/services/products";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { getFooterPages } from "@/lib/services/content";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://labonno.com").replace(/\/$/, "");

/** Every public page, generated from the catalogue so new products appear automatically. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/size-guide`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/track-order`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/shipping-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/return-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [products, categories, collections, pages] = await Promise.all([
      listProducts({ perPage: 200, status: "active" } as never),
      getCategories(),
      getCollections(),
      getFooterPages(),
    ]);

    const productRoutes = products.products.map((product) => ({
      url: `${BASE}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryRoutes = categories.map((category) => ({
      url: `${BASE}/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const collectionRoutes = collections.map((collection) => ({
      url: `${BASE}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const pageRoutes = pages.map((page) => ({
      url: `${BASE}/p/${page.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...collectionRoutes, ...pageRoutes];
  } catch {
    // A database hiccup must not break crawling — the static pages still ship.
    return staticRoutes;
  }
}
