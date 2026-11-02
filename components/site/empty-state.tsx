import Link from "next/link";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream-100/40 px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 grid size-14 place-items-center rounded-full bg-cream-200/70 text-ink-muted">{icon}</div>
      ) : null}
      <h2 className="font-serif text-2xl font-light">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 rounded-full bg-ink px-7 py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft"
        >
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
