"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Scroll-triggered entrance animation.
 *
 * Elements start slightly translated and fade in once they enter the viewport, once.
 * It is deliberately CSS-driven (see `.reveal` in globals.css) so there is no layout
 * thrash, and it is a no-op for anyone with `prefers-reduced-motion: reduce` — the
 * stylesheet shows the content immediately in that case.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger in milliseconds, e.g. index * 60 for a grid. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (or reduced motion): show immediately.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref as React.Ref<HTMLElement>}
      className={cn("reveal", className)}
      data-revealed={shown ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
