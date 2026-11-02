import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  align = "center",
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  align?: "center" | "left";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-line/70 bg-cream-100/60",
        align === "center" ? "py-12 text-center md:py-16" : "py-10 md:py-14",
        className
      )}
    >
      <div className="shell">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className={cn("mb-5 flex flex-wrap gap-1.5 text-[10.5px] uppercase tracking-wide2 text-ink-muted", align === "center" && "justify-center")}>
            <Link href="/" className="hover:text-ink">Home</Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.label} className="flex gap-1.5">
                <span aria-hidden>/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-ink">{crumb.label}</Link>
                ) : (
                  <span className="text-ink">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        {eyebrow ? (
          <p className={cn("label-line text-[9.5px] text-ink-muted", align === "center" && "justify-center")}>{eyebrow}</p>
        ) : null}
        <h1 className={cn("mt-3 display-2", align === "center" ? "text-balance" : "")}>{title}</h1>
        {description ? (
          <p className={cn("mt-4 text-[13.5px] leading-relaxed text-ink-soft", align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl")}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
