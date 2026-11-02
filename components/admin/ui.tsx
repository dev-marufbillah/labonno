import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function AdminPageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-serif text-[28px] font-light leading-tight text-ink">{title}</h1>
        {description ? <p className="mt-1 text-[12.5px] text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-line bg-cream-50/80", className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            {title ? <h2 className="font-serif text-lg leading-tight text-ink">{title}</h2> : null}
            {description ? <p className="text-[11.5px] text-ink-muted">{description}</p> : null}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "positive" | "warning";
}) {
  const body = (
    <div className="rounded-xl border border-line bg-cream-50/80 p-4 transition hover:border-gold">
      <p className="text-[9.5px] uppercase tracking-label text-ink-muted">{label}</p>
      <p
        className={cn(
          "mt-2 font-serif text-[26px] leading-none",
          tone === "positive" && "text-emerald-800",
          tone === "warning" && "text-amber-800"
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] text-ink-muted">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function TableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-12 text-center text-[12.5px] text-ink-muted">
        {message}
      </td>
    </tr>
  );
}

export function AdminSearch({ action, placeholder, defaultValue, extra }: { action: string; placeholder: string; defaultValue?: string; extra?: React.ReactNode }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-full min-w-[180px] max-w-xs rounded-md border border-line bg-white/70 px-3 text-[12.5px] outline-none focus:border-gold"
      />
      {extra}
      <button type="submit" className="h-9 rounded-md border border-line px-4 text-[10px] uppercase tracking-wide2 text-ink transition hover:border-ink">
        Search
      </button>
    </form>
  );
}

export function PaginationBar({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const build = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) if (value) search.set(key, value);
    search.set("page", String(target));
    return `${basePath}?${search.toString()}`;
  };
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-[11px] text-ink-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={build(page - 1)} className="rounded-md border border-line px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink">
            Prev
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={build(page + 1)} className="rounded-md border border-line px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink">
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-wide2 text-ink-soft">{label}</label>
      {children}
      {hint && !error ? <p className="mt-1 text-[10.5px] text-ink-muted">{hint}</p> : null}
      {error ? <p className="mt-1 text-[10.5px] text-red-700">{error}</p> : null}
    </div>
  );
}
