import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialSection({
  eyebrow,
  title,
  body,
  image,
  ctaLabel,
  ctaHref,
  imagePosition = "right",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
  imagePosition?: "left" | "right";
}) {
  return (
    <section className="shell pt-14 md:pt-20">
      <div className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${imagePosition === "left" ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-cream-200">
          <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="max-w-md">
          <p className="label-line text-[9.5px]">{eyebrow || "The house"}</p>
          <h2 className="mt-4 display-3">{title}</h2>
          <p className="mt-4 text-[14px] leading-[1.85] text-ink-soft">{body}</p>
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="group mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-label text-ink"
            >
              {ctaLabel}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
