"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check, ArrowUpDown } from "lucide-react";
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

/** Shared state + URL helpers for the bar, the sidebar and the mobile drawer. */
function useFilterState(basePath?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    router.push(`${basePath ?? pathname}?${next.toString()}`, { scroll: false });
  };

  const sizes = (params.get("size") ?? "").split(",").filter(Boolean);
  const colors = (params.get("color") ?? "").split(",").filter(Boolean);
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const sort = params.get("sort") ?? "newest";
  const activeCount = sizes.length + colors.length + (min ? 1 : 0) + (max ? 1 : 0);

  const toggleList = (key: "size" | "color", value: string) => {
    update((next) => {
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      if (updated.length) next.set(key, updated.join(","));
      else next.delete(key);
    });
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (sort !== "newest") next.set("sort", sort);
    router.push(`${basePath ?? pathname}?${next.toString()}`, { scroll: false });
  };

  const remove = (key: "size" | "color" | "min" | "max", value?: string) => {
    update((next) => {
      if (key === "min" || key === "max") next.delete(key);
      else {
        const current = (next.get(key) ?? "").split(",").filter(Boolean).filter((item) => item !== value);
        if (current.length) next.set(key, current.join(","));
        else next.delete(key);
      }
    });
  };

  return { update, sizes, colors, min, max, sort, activeCount, toggleList, clearAll, remove };
}

type FilterState = ReturnType<typeof useFilterState>;

function FilterPanel({ options, state }: { options: FilterOptions; state: FilterState }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => state.toggleList("size", size)}
              aria-pressed={state.sizes.includes(size)}
              className={cn(
                "min-w-11 rounded-full border px-3.5 py-2 text-[11px] uppercase tracking-wide2 transition duration-200",
                state.sizes.includes(size)
                  ? "border-ink bg-ink text-cream shadow-sm"
                  : "border-line text-ink-soft hover:-translate-y-px hover:border-gold hover:text-ink"
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
              onClick={() => state.toggleList("color", color.name)}
              title={color.name}
              aria-label={color.name}
              aria-pressed={state.colors.includes(color.name)}
              className={cn(
                "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[11px] transition duration-200",
                state.colors.includes(color.name)
                  ? "border-ink text-ink shadow-sm"
                  : "border-line text-ink-muted hover:-translate-y-px hover:border-gold"
              )}
            >
              <span className="size-5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
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
            state.update((next) => {
              const min = String(form.get("min") ?? "");
              const max = String(form.get("max") ?? "");
              if (min) next.set("min", min);
              else next.delete("min");
              if (max) next.set("max", max);
              else next.delete("max");
            });
          }}
        >
          <input
            name="min"
            type="number"
            defaultValue={state.min}
            placeholder={String(options.bounds.min)}
            aria-label="Minimum price"
            className="h-10 w-full rounded-md border border-line bg-white/70 px-3 text-[12px] outline-none focus:border-gold"
          />
          <span className="text-ink-muted">–</span>
          <input
            name="max"
            type="number"
            defaultValue={state.max}
            placeholder={String(options.bounds.max)}
            aria-label="Maximum price"
            className="h-10 w-full rounded-md border border-line bg-white/70 px-3 text-[12px] outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="grid size-10 shrink-0 place-items-center rounded-md border border-line text-ink-muted transition hover:border-ink hover:text-ink"
            aria-label="Apply price filter"
          >
            <Check className="size-4" />
          </button>
        </form>
        <p className="mt-2 text-[10.5px] text-ink-muted">
          Range {formatMoney(options.bounds.min)} – {formatMoney(options.bounds.max)}
        </p>
      </div>

      {state.activeCount > 0 ? (
        <button
          type="button"
          onClick={state.clearAll}
          className="flex items-center gap-1.5 text-[11px] text-gold-dark underline underline-offset-4 hover:text-ink"
        >
          <X className="size-3" /> Clear all filters
        </button>
      ) : null}
    </div>
  );
}

/** Sticky bar across the top of every listing: filters, active chips and sorting. */
export function FilterToolbar({
  options,
  total,
  basePath,
}: {
  options: FilterOptions;
  total: number;
  basePath?: string;
}) {
  const state = useFilterState(basePath);
  const [open, setOpen] = React.useState(false);
  const quickSizes = options.sizes.slice(0, 6);

  return (
    <div className="sticky top-[62px] z-30 -mx-4 border-y border-line md:top-[76px] bg-cream-50/95 backdrop-blur-md md:mx-0 md:rounded-xl md:border md:shadow-[0_10px_40px_-30px_rgba(0,0,0,0.45)]">
      <div className="flex flex-col gap-3 px-4 py-3.5 md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white/70 px-4 text-[10.5px] uppercase tracking-label text-ink transition hover:border-ink lg:hidden"
            >
              <SlidersHorizontal className="size-3.5" /> Filters
              {state.activeCount > 0 ? (
                <span className="grid size-5 place-items-center rounded-full bg-ink text-[9px] text-cream">
                  {state.activeCount}
                </span>
              ) : null}
            </button>

            <div className="hidden items-center gap-1.5 lg:flex">
              {quickSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => state.toggleList("size", size)}
                  aria-pressed={state.sizes.includes(size)}
                  className={cn(
                    "h-11 min-w-11 rounded-full border px-3.5 text-[11px] uppercase tracking-wide2 transition duration-200",
                    state.sizes.includes(size)
                      ? "border-ink bg-ink text-cream"
                      : "border-line bg-white/60 text-ink-soft hover:-translate-y-px hover:border-gold hover:text-ink"
                  )}
                >
                  {size}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="ml-1 inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-[10.5px] uppercase tracking-label text-ink-soft transition hover:border-gold hover:text-ink"
              >
                <SlidersHorizontal className="size-3.5" />
                All filters
                {state.activeCount > 0 ? (
                  <span className="grid size-5 place-items-center rounded-full bg-ink text-[9px] text-cream">
                    {state.activeCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-[11px] uppercase tracking-label text-ink-muted sm:block">
              {total} piece{total === 1 ? "" : "s"}
            </p>
            <label className="flex items-center gap-2">
              <ArrowUpDown className="hidden size-3.5 text-ink-muted sm:block" />
              <span className="hidden text-[10px] uppercase tracking-wide2 text-ink-muted sm:inline">Sort</span>
              <select
                value={state.sort}
                onChange={(event) => state.update((next) => next.set("sort", event.target.value))}
                aria-label="Sort products"
                className="h-11 cursor-pointer rounded-full border border-line bg-white/70 px-3.5 pr-8 text-[11px] uppercase tracking-wide2 text-ink outline-none transition focus:border-gold"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {state.activeCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
            {state.sizes.map((size) => (
              <Chip key={`s-${size}`} label={`Size ${size}`} onRemove={() => state.remove("size", size)} />
            ))}
            {state.colors.map((color) => (
              <Chip key={`c-${color}`} label={color} onRemove={() => state.remove("color", color)} />
            ))}
            {state.min ? <Chip label={`From ৳${state.min}`} onRemove={() => state.remove("min")} /> : null}
            {state.max ? <Chip label={`Up to ৳${state.max}`} onRemove={() => state.remove("max")} /> : null}
            <button
              type="button"
              onClick={state.clearAll}
              className="ml-1 text-[10.5px] uppercase tracking-label text-gold-dark underline underline-offset-4 hover:text-ink"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[90%] max-w-sm overflow-y-auto bg-cream-50 p-6 shadow-luxe focus:outline-none data-[state=open]:animate-slide-in-left">
            <div className="mb-6 flex items-center justify-between">
              <DialogPrimitive.Title className="font-serif text-xl">Filters</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                Filter products by size, colour and price
              </DialogPrimitive.Description>
              <DialogPrimitive.Close aria-label="Close filters" className="p-1.5">
                <X className="size-5" strokeWidth={1.4} />
              </DialogPrimitive.Close>
            </div>
            <FilterPanel options={options} state={state} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-8 w-full rounded-full bg-ink py-3.5 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft"
            >
              Show {total} piece{total === 1 ? "" : "s"}
            </button>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex animate-fade-in items-center gap-1 rounded-full border border-line bg-white/80 py-1 pl-2.5 pr-1.5 text-[10.5px] text-ink">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="grid size-5 place-items-center rounded-full text-ink-muted transition hover:bg-cream-200 hover:text-ink"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

/** Desktop sidebar — same controls, always visible next to the grid. */
export function FilterSidebar({ options, basePath }: { options: FilterOptions; basePath?: string }) {
  const state = useFilterState(basePath);
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-32 rounded-xl border border-line bg-cream-50/70 p-5">
        <FilterPanel options={options} state={state} />
      </div>
    </aside>
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
    router.push(`${basePath ?? pathname}?${next.toString()}`, { scroll: false });
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
