"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = React.useState(5);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { productId, rating: 5 },
  });

  const onSubmit = async (values: ReviewInput) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, productId, rating, productSlug }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not submit review");
      toast.success(data.message ?? "Thank you — your review is with our team for approval.");
      reset({ productId, rating: 5, title: "", body: "", author: "" });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit review");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface space-y-4 p-5">
      <p className="font-serif text-lg">Write a review</p>
      <div>
        <Label>Your rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star className={cn("size-5", value <= rating ? "fill-gold text-gold" : "text-line")} strokeWidth={1.2} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="review-author">Name</Label>
          <Input id="review-author" placeholder="Farhana R." {...register("author")} />
          <FieldError message={errors.author?.message} />
        </div>
        <div>
          <Label htmlFor="review-title">Title</Label>
          <Input id="review-title" placeholder="Beautifully finished" {...register("title")} />
          <FieldError message={errors.title?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="review-body">Review</Label>
        <Textarea id="review-body" placeholder="How does it fit? How is the fabric?" {...register("body")} />
        <FieldError message={errors.body?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? "Submitting" : "Submit review"}
      </Button>
      <p className="text-[11px] text-ink-muted">Reviews are published after moderation by our studio.</p>
    </form>
  );
}
