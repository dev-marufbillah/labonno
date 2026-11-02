"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-6 py-20">
      <div className="max-w-md text-center">
        <p className="label-line justify-center text-[9px]">Something went wrong</p>
        <h1 className="mt-4 display-3">A small interruption</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
          We could not load this page just now. Please try again — if it keeps happening our studio would like to know.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-full bg-ink px-7 py-3 text-[10px] uppercase tracking-label text-cream">
            Try again
          </button>
          <Link href="/" className="rounded-full border border-ink/25 px-7 py-3 text-[10px] uppercase tracking-label text-ink">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
