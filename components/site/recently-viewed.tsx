"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/format";

interface RecentItem {
  slug: string;
  name: string;
  image: string;
  price: number;
}

const KEY = "labonno.recent.v1";

export function RecentlyViewedTracker({ item }: { item: RecentItem }) {
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const list = raw ? (JSON.parse(raw) as RecentItem[]) : [];
      const next = [item, ...list.filter((entry) => entry.slug !== item.slug)].slice(0, 8);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures.
    }
  }, [item]);
  return null;
}

export function RecentlyViewedRail({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = React.useState<RecentItem[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const list = raw ? (JSON.parse(raw) as RecentItem[]) : [];
      setItems(list.filter((entry) => entry.slug !== excludeSlug).slice(0, 4));
    } catch {
      setItems([]);
    }
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="shell pt-16">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-xl">Recently viewed</h2>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item) => (
          <Link key={item.slug} href={`/products/${item.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-200">
              <Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="truncate font-serif text-[14px]">{item.name}</span>
              <span className="shrink-0 text-[11px] text-ink-muted">{formatMoney(item.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
