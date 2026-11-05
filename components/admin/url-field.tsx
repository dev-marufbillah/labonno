"use client";

import * as React from "react";

/**
 * A read-only URL field whose text is selected on focus, so the whole link can be
 * copied with one click. It lives in a client component because focus handlers
 * cannot be passed from a server component.
 */
export function UrlField({ value }: { value: string }) {
  return (
    <input
      readOnly
      value={value}
      onFocus={(event) => event.currentTarget.select()}
      className="mt-1.5 w-full rounded border border-line bg-white/70 px-1.5 py-1 text-[9.5px] text-ink-muted"
    />
  );
}
