"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { Dialog } from "@radix-ui/react-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "bestselling", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export interface FilterOptions {
  sizes: string[];
  colors: { name: string; hex: string }[];
  bounds: { min: number; max: number };
}

export function FilterToolbar({
  options,
  total,
  basePath,
}: {
  options: FilterOptions;
  total: number;
  basePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    router.push(`${basePath ?? pathname}?${next.toString()}`, { scroll: false });
  };

  const activeSizes = (params.get("size") ?? "").split(",").filter(Boolean);
  const activeColors = (params.get("color") ?? "").split(",").filter(Boolean);
  const minPrice = params.get("min") ?? "";
  const maxPrice = params.get("max") ?? "";
  const sort = params.get("sort") ?? "newest";
  const activeCount =
    activeSizes.length + activeColors.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const toggleList = (key: "size" | "color", value: string) => {
    update((next) => {
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (updated.length) next.set(key, updated.join(","));
      else next.delete(key);
    });
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (sort !== "newest") next.set("sort", sort);
    router.push(`${basePath ?? pathname}?${next.toString()}`, { scroll: false });
  };

  const Panel = (
    <div className="space-y-7">
      <div>
        <p className="label mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleList("size", size)}
              className={cn(
                "min-w-10 rounded-full border px-3 py-1.5 text-[10.5px] uppercase tracking-wide2 transition",
                activeSizes.includes(size)
                  ? "border-ink bg-ink text-cream"
                  : "border-line text-ink-soft hover:border-ink"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label mb-3">Colour</p>
        <div className="flex flex-wrap gap-2.5">
          {options.colors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleList("color", color.name)}
              title={color.name}
              aria-label={color.name}
              aria-pressed={activeColors.includes(color.name)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[10.5px] transition",
                activeColors.includes(color.name) ? "border-ink text-ink" : "border-line text-ink-muted hover:border-ink/50"
              )}
            >
              <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label mb-3">Price (৳)</p>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            update((next) => {
              const min = String(form.get("min") ?? "");
              const max = String(form.get("max") ?? "");
              if (min) next.set("min", min);
              else next.delete("min");
              if (max) next.set("max", max);
              else next.delete("max");
            });
            setMobileOpen(false);
          }}
        >
          <input
            name="min"
            type="number"
            defaultValue={minPrice}
            placeholder={String(options.bounds.min)}
            aria-label="Minimum price"
            className="h-9 w-full rounded-md border border-line bg-white/70 px-2.5 text-[12px] outline-none focus:border-gold"
          />
          <span className="text-ink-muted">–</span>
          <input
            name="max"
            type="number"
            defaultValue={maxPrice}
            placeholder={String(options.bounds.max)}
            aria-label="Maximum price"
            className="h-9 w-full rounded-md border border-line bg-white/70 px-2.5 text-[12px] outline-none focus:border-gold"
          />
          <button type="submit" className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-ink-muted hover:border-ink hover:text-ink" aria-label="Apply price filter">
            <Check className="size-3.5" />
          </button>
        </form>
        <p className="mt-2 text-[10.5px] text-ink-muted">
          Range {formatMoney(options.bounds.min)} – {formatMoney(options.bounds.max)}
        </p>
      </div>

      {activeCount > 0 ? (
        <button type="button" onClick={clearAll} className="flex items-center gap-1.5 text-[11px] text-gold-dark underline underline-offset-4">
          <X className="size-3" /> Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="mb-7 flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[10px] uppercase tracking-label text-ink-soft transition hover:border-ink hover:text-ink lg:hidden"
          >
            <SlidersHorizontal className="size-3" /> Filters
            {activeCount > 0 && <span className="rounded-full bg-ink px-1.5 text-[9px] text-cream">{activeCount}</span>}
          </button>
          <p className="text-[11px] uppercase tracking-wide2 text-ink-muted">{total} pieces</p>
        </div>
        <label className="flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-ink-muted">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(event) => update((next) => next.set("sort", event.target.value))}
            aria-label="Sort products"
            className="cursor-pointer border-0 border-b border-line bg-transparent py-1 pr-6 text-[11px] uppercase tracking-wide2 text-ink outline-none focus:border-ink"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <aside className="hidden w-56 shrink-0 lg:block">{Panel}</aside>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[88%] max-w-sm overflow-y-auto bg-cream-50 p-6 shadow-luxe focus:outline-none">
            <div className="mb-6 flex items-center justify-between">
              <DialogPrimitive.Title className="font-serif text-xl">Filters</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Filter products by size, colour and price</DialogPrimitive.Description>
              <DialogPrimitive.Close aria-label="Close filters" className="p-1.5">
                <X className="size-5" strokeWidth={1.4} />
              </DialogPrimitive.Close>
            </div>
            {Panel}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-8 w-full rounded-full bg-ink py-3 text-[10px] uppercase tracking-label text-cream"
            >
              Show {total} pieces
            </button>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>
    </>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  const go = (target: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(target));
    router.push(`${basePath ?? pathname}?${next.toString()}`);
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-line px-4 py-2 text-[10px] uppercase tracking-wide2 text-ink-soft transition hover:border-ink disabled:opacity-40"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => go(i + 1)}
          aria-current={page === i + 1 ? "page" : undefined}
          className={cn(
            "size-8 rounded-full text-[11px] transition",
            page === i + 1 ? "bg-ink text-cream" : "text-ink-muted hover:bg-cream-200"
          )}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-line px-4 py-2 text-[10px] uppercase tracking-wide2 text-ink-soft transition hover:border-ink disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
