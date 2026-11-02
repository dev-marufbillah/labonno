import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {align === "center" ? (
        <div className="flex w-full items-center justify-center gap-5">
          <span className="h-px w-10 bg-line sm:w-24" />
          <h2 className="font-serif text-[26px] font-light leading-none tracking-[-0.01em] sm:text-[32px]">{title}</h2>
          <span className="h-px w-10 bg-line sm:w-24" />
        </div>
      ) : (
        <>
          {eyebrow ? <p className="label-line">{eyebrow}</p> : null}
          <h2 className="display-3">{title}</h2>
        </>
      )}
      {subtitle ? <p className="max-w-xl text-[13px] leading-relaxed text-ink-muted">{subtitle}</p> : null}
      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="link-underline mt-1 text-[10px] uppercase tracking-label text-ink-soft hover:text-ink"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
