"use client";

import * as React from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/ui/reveal";
import { formatMoney } from "@/lib/utils/format";

export interface OfferCard {
  code: string;
  description: string;
  label: string;
  minSubtotal: number;
}

/** "Offers" band on the home page — every card comes from Admin → Discounts. */
export function OfferStrip({ offers, title, subtitle }: { offers: OfferCard[]; title: string; subtitle?: string }) {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!offers.length) return null;

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`Copied ${code}`, { description: "Paste it in the bag or at checkout." });
      setTimeout(() => setCopied((current) => (current === code ? null : current)), 2200);
    } catch {
      toast.error("Copy failed — please type the code.");
    }
  };

  return (
    <section className="shell py-10 md:py-14">
      <Reveal>
        <div className="flex flex-col items-baseline justify-between gap-2 sm:flex-row">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="size-3 text-gold-dark" /> {title}
            </p>
            {subtitle ? <p className="mt-1 text-[12.5px] text-ink-muted">{subtitle}</p> : null}
          </div>
          <p className="text-[10px] uppercase tracking-label text-ink-muted">Limited period</p>
        </div>
      </Reveal>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer, index) => (
          <Reveal key={offer.code} delay={index * 80}>
            <button
              type="button"
              onClick={() => copy(offer.code)}
              className="group flex h-full w-full flex-col justify-between gap-3 rounded-xl border border-dashed border-gold/50 bg-gradient-to-br from-cream-100/80 to-cream-50 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.5)]"
            >
              <div>
                <p className="font-serif text-xl text-ink">{offer.label}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{offer.description}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-ink/15 bg-white/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink">
                  {offer.code}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-label text-gold-dark">
                  {copied === offer.code ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied === offer.code ? "Copied" : "Copy"}
                </span>
              </div>
              {offer.minSubtotal > 0 ? (
                <p className="text-[10px] uppercase tracking-wide2 text-ink-muted">
                  On orders over {formatMoney(offer.minSubtotal)}
                </p>
              ) : null}
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
