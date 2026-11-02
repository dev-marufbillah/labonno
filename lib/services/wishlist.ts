import "server-only";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { ProductDoc, WishlistDoc } from "@/lib/db/types";

export async function getWishlistIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  const doc = await col<WishlistDoc>("wishlists").findOne({ userId });
  return doc?.productIds ?? [];
}

export async function getWishlistProducts(userId: string): Promise<ProductDoc[]> {
  const ids = await getWishlistIds(userId);
  const valid = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (!valid.length) return [];
  return col<ProductDoc>("products").find({ _id: { $in: valid }, status: "published" }).toArray();
}

export async function toggleWishlist(userId: string, productId: string): Promise<{ added: boolean }> {
  const doc = await col<WishlistDoc>("wishlists").findOne({ userId });
  const ids = doc?.productIds ?? [];
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
  await col<WishlistDoc>("wishlists").updateOne(
    { userId },
    { $set: { productIds: next, updatedAt: new Date() }, $setOnInsert: { userId } },
    { upsert: true }
  );
  return { added: !exists };
}
