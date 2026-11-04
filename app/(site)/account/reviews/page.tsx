import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { requireCustomer } from "@/lib/auth/server";
import { getReviewsByUser } from "@/lib/services/reviews";
import { formatDate } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My reviews", robots: { index: false, follow: false } };

export default async function MyReviewsPage() {
  const user = await requireCustomer("/account/reviews");
  const reviews = await getReviewsByUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light">My reviews</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Reviews you have written. The studio approves each one before it appears on the product page.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-8 text-center">
          <p className="font-serif text-xl">No reviews yet</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Bought something you love? Open the product page and share a note.
          </p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream">
            Browse the collection
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {reviews.map((review) => (
            <li key={String(review._id)} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/products/${review.productSlug}`} className="font-serif text-[15px] hover:text-gold-dark">
                  {review.productName}
                </Link>
                <StatusBadge value={review.status} />
              </div>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={index < review.rating ? "size-3 fill-gold text-gold" : "size-3 text-line"} />
                ))}
                <span className="ml-2">{formatDate(review.createdAt)}</span>
              </p>
              {review.title ? <p className="mt-2 text-[13.5px] font-medium">{review.title}</p> : null}
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
