"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Keeps the shopper on the results instead of throwing them back to the top.
 *
 * Whenever a listing URL carries filter/sort/page parameters (a category tap, a size
 * chip, "Show 3 pieces", pagination) the browser used to land at the very top — above
 * the hero — so every refinement meant scrolling down again. This brings the grid into
 * view (instantly on the first render, smoothly for every change after that).
 *
 * A plain "/shop" visit is left alone, so the editorial hero still gets seen.
 */
export function ListingScroll({ targetId = "listing" }: { targetId?: string }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const query = params.toString();
  const first = React.useRef(true);

  React.useEffect(() => {
    if (!query) return;
    // Prefer the category rail so the chips, the filter bar and the first row of
    // products are all on screen; fall back to the grid itself.
    const target =
      document.querySelector<HTMLElement>("[data-listing-anchor]") ?? document.getElementById(targetId);
    if (!target) return;

    const header = window.innerWidth >= 768 ? 88 : 74; // sticky shop header
    const top = target.getBoundingClientRect().top + window.scrollY - header;
    window.scrollTo({ top: Math.max(top, 0), behavior: first.current ? "auto" : "smooth" });
    first.current = false;
  }, [query, pathname, targetId]);

  return null;
}
