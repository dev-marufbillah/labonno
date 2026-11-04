import "server-only";
import { col } from "@/lib/db/mongo";
import type { ReviewDoc } from "@/lib/db/types";

/** A customer's own reviews, newest first — used by /account/reviews. */
export async function getReviewsByUser(userId: string, limit = 50): Promise<ReviewDoc[]> {
  return col<ReviewDoc>("reviews").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
}
