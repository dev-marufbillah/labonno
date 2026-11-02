import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { listReviews } from "@/lib/services/content";
import { AdminPageTitle, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/admin/action-button";
import { deleteReview, setReviewStatus } from "@/lib/actions/marketing";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reviews" };

const STATUSES = [
  { label: "Pending", value: "pending" as const },
  { label: "Approved", value: "approved" as const },
  { label: "Rejected", value: "rejected" as const },
];

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = (params.status ?? "pending") as "pending" | "approved" | "rejected";
  const reviews = await listReviews(status);

  return (
    <div>
      <AdminPageTitle title="Reviews" description="Moderate customer reviews before they appear on product pages." />
      <Panel>
        <div className="mb-4 flex gap-1.5">
          {STATUSES.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/reviews?status=${tab.value}`}
              className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-wide2 transition ${
                status === tab.value ? "bg-ink text-cream" : "bg-cream-200/60 text-ink-soft hover:bg-cream-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Review</TH>
              <TH>Product</TH>
              <TH>Rating</TH>
              <TH>Date</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {reviews.map((review) => (
              <TR key={String(review._id)}>
                <TD className="max-w-[320px]">
                  <p className="font-medium text-ink">{review.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] text-ink-muted">{review.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide2 text-ink-muted">{review.author}</p>
                </TD>
                <TD>
                  <Link href={`/products/${review.productSlug}`} className="text-[11.5px] hover:text-gold-dark">
                    {review.productName}
                  </Link>
                </TD>
                <TD>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={i < review.rating ? "size-3 fill-gold text-gold" : "size-3 text-line"} strokeWidth={1} />
                    ))}
                  </span>
                </TD>
                <TD>{formatDate(review.createdAt)}</TD>
                <TD><Badge tone={review.status === "approved" ? "green" : review.status === "pending" ? "amber" : "red"}>{review.status}</Badge></TD>
                <TD>
                  <div className="flex items-center justify-end gap-1.5">
                    {review.status !== "approved" ? (
                      <ActionButton action={async () => setReviewStatus(String(review._id), "approved")} label="Approve" />
                    ) : null}
                    {review.status !== "rejected" ? (
                      <ActionButton action={async () => setReviewStatus(String(review._id), "rejected")} label="Reject" />
                    ) : null}
                    <ActionButton
                      action={async () => deleteReview(String(review._id))}
                      label="Delete"
                      destructive
                      confirmTitle="Delete this review?"
                      confirmDescription="This removes the review permanently."
                      confirmLabel="Delete"
                    />
                  </div>
                </TD>
              </TR>
            ))}
            {reviews.length === 0 ? <TableEmpty colSpan={6} message={`No ${status} reviews.`} /> : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
