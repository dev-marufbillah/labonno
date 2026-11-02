import "server-only";
import { col } from "@/lib/db/mongo";
import type { CategoryDoc, CollectionDoc } from "@/lib/db/types";

export async function getCategories(opts: { includeHidden?: boolean } = {}): Promise<CategoryDoc[]> {
  return col<CategoryDoc>("categories")
    .find(opts.includeHidden ? {} : { visible: true })
    .sort({ order: 1, name: 1 })
    .toArray();
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDoc | null> {
  return col<CategoryDoc>("categories").findOne({ slug });
}

export async function getCollections(opts: { includeHidden?: boolean } = {}): Promise<CollectionDoc[]> {
  return col<CollectionDoc>("collections")
    .find(opts.includeHidden ? {} : { visible: true })
    .sort({ order: 1, name: 1 })
    .toArray();
}

export async function getCollectionBySlug(slug: string): Promise<CollectionDoc | null> {
  return col<CollectionDoc>("collections").findOne({ slug });
}

export async function getProductCountsByCategory(): Promise<Record<string, number>> {
  const rows = await col("products")
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((r) => [String(r._id), r.count]));
}
