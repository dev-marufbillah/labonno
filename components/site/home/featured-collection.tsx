import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FeaturedCollection({
  eyebrow,
  title,
  subtitle,
  image,
  ctaLabel,
  ctaHref,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  ctaLabel?: string;
  ctaHref: string;
}) {
  return (
    <section className="shell pt-10 md:pt-16">
      <Link href={ctaHref} className="group relative block overflow-hidden rounded-lg md:rounded-xl">
        <div className="relative h-[340px] w-full sm:h-[420px] lg:h-[480px]">
          <Image
            src={image || "/images/collection-featured.jpg"}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/55 to-transparent md:from-cream/90 md:via-cream/30" />
        </div>
        <div className="absolute inset-y-0 left-0 flex max-w-sm flex-col justify-center px-6 sm:px-10 lg:px-16">
          <p className="label-line text-[9.5px] text-ink-soft">{eyebrow || "Featured collection"}</p>
          <h2 className="mt-4 font-serif text-[38px] font-light leading-[0.98] tracking-[-0.02em] text-ink sm:text-[48px] lg:text-[54px]">
            {title}
          </h2>
          {subtitle ? <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-soft">{subtitle}</p> : null}
          <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-ink/30 px-6 py-3 text-[9.5px] uppercase tracking-label text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-cream">
            {ctaLabel || "Explore collection"}
            <ArrowRight className="size-3" />
          </span>
        </div>
      </Link>
    </section>
  );
}
