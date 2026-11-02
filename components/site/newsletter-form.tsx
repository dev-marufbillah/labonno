"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function NewsletterForm({ buttonLabel = "Subscribe", tone = "dark" }: { buttonLabel?: string; tone?: "dark" | "light" }) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Subscription failed");
      toast.success(data.message ?? "You are subscribed");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-md items-center gap-2">
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email Address"
          aria-label="Email address"
          required
          className={cn(
            "h-11 w-full rounded-full px-4 text-[12.5px] outline-none transition",
            tone === "dark"
              ? "border border-line bg-white/70 text-ink placeholder:text-ink-muted/70 focus:border-gold focus:bg-white"
              : "border border-cream/25 bg-transparent text-cream placeholder:text-cream/50 focus:border-cream/60"
          )}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "group flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[10px] uppercase tracking-label transition",
          tone === "dark" ? "bg-ink text-cream hover:bg-ink-soft" : "bg-cream text-ink hover:bg-white",
          loading && "opacity-70"
        )}
      >
        {loading ? "Sending" : buttonLabel}
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
