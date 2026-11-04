import Link from "next/link";
import type { ProductDoc } from "@/lib/db/types";
import { ProductCard } from "@/components/site/product-card";
import { toCardData } from "@/lib/utils/product-card";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/ui/reveal";

export function ProductGridSection({
  eyebrow,
  title,
  subtitle,
  products,
  ctaLabel,
  ctaHref,
  columns = 4,
  background = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: ProductDoc[];
  ctaLabel?: string;
  ctaHref?: string;
  columns?: 3 | 4;
  background?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className={background ? "mt-14 bg-cream-100 py-14" : "shell pt-14 md:pt-20"}>
      <div className={background ? "shell" : ""}>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          align="center"
        />
        <div
          className={
            columns === 3
              ? "mt-9 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3"
              : "mt-9 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4"
          }
        >
          {products.map((product, i) => (
            <Reveal key={String(product._id)} delay={i * 70}>
              <ProductCard product={toCardData(product)} priority={i < 2} />
            </Reveal>
          ))}
        </div>
        {ctaHref && ctaLabel ? (
          <div className="mt-10 flex justify-center">
            <Link
              href={ctaHref}
              className="rounded-full border border-ink/25 px-8 py-3 text-[10px] uppercase tracking-label text-ink transition hover:bg-ink hover:text-cream"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
