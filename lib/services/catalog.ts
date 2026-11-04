import "server-only";
import { cachedRead, TTL } from "./cache";
import { col } from "@/lib/db/mongo";
import type { CategoryDoc, CollectionDoc } from "@/lib/db/types";

async function read_getCategories(opts: { includeHidden?: boolean } = {}): Promise<CategoryDoc[]> {
  return col<CategoryDoc>("categories")
    .find(opts.includeHidden ? {} : { visible: true })
    .sort({ order: 1, name: 1 })
    .toArray();
}

async function read_getCategoryBySlug(slug: string): Promise<CategoryDoc | null> {
  return col<CategoryDoc>("categories").findOne({ slug });
}

async function read_getCollections(opts: { includeHidden?: boolean } = {}): Promise<CollectionDoc[]> {
  return col<CollectionDoc>("collections")
    .find(opts.includeHidden ? {} : { visible: true })
    .sort({ order: 1, name: 1 })
    .toArray();
}

async function read_getCollectionBySlug(slug: string): Promise<CollectionDoc | null> {
  return col<CollectionDoc>("collections").findOne({ slug });
}

async function read_getProductCountsByCategory(): Promise<Record<string, number>> {
  const rows = await col("products")
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((r) => [String(r._id), r.count]));
}

export const getCategories = cachedRead("categories", TTL.catalog, read_getCategories);
export const getCategoryBySlug = cachedRead("category", TTL.catalog, read_getCategoryBySlug);
export const getCollections = cachedRead("collections", TTL.catalog, read_getCollections);
export const getCollectionBySlug = cachedRead("collection", TTL.catalog, read_getCollectionBySlug);
export const getProductCountsByCategory = cachedRead("category-counts", TTL.catalog, read_getProductCountsByCategory);
