import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config/site";
import { listProducts } from "@/lib/services/products";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { getAllPages } from "@/lib/services/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const [products, categories, collections, pages] = await Promise.all([
    listProducts({ perPage: 60 }),
    getCategories(),
    getCollections(),
    getAllPages(),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/categories",
    "/collections",
    "/about",
    "/contact",
    "/faq",
    "/size-guide",
    "/shipping-policy",
    "/return-policy",
    "/privacy-policy",
    "/terms",
    "/track-order",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((collection) => ({
      url: `${base}/collections/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...pages.map((page) => ({
      url: `${base}/p/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
