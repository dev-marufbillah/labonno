import "server-only";
import { cache } from "react";

/**
 * Two-layer read cache for the storefront.
 *
 * 1. `remember()` — a tiny in-process TTL cache. Catalogue, CMS and settings reads
 *    change rarely but were being re-queried on every request, which is what made
 *    pages feel slow against a remote Atlas cluster.
 * 2. `requestMemo()` — React's `cache()`, so several components in the same render
 *    (header, footer, page) share one query instead of repeating it.
 *
 * Nothing is written to a shared store, so no value is ever JSON round-tripped and
 * Dates/ObjectIds survive intact. Every admin mutation calls `invalidateSiteCache()`
 * so a saved change is visible on the next request.
 */

interface Entry {
  value: unknown;
  expiresAt: number;
  generation: number;
}

const store = new Map<string, Entry>();
let generation = 0;

/** TTLs: content is edited rarely, so a minute is safe and still feels live. */
export const TTL = {
  settings: 15_000,
  content: 15_000,
  catalog: 15_000,
  products: 15_000,
} as const;

export function invalidateSiteCache(): void {
  generation += 1;
  store.clear();
}

export async function remember<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now && hit.generation === generation) {
    return hit.value as T;
  }

  // Share a single in-flight promise so concurrent renders do not duplicate queries.
  const pendingKey = `pending:${key}`;
  const pending = store.get(pendingKey);
  if (pending && pending.generation === generation) {
    return pending.value as Promise<T>;
  }

  const promise = load()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs, generation });
      return value;
    })
    .finally(() => {
      store.delete(pendingKey);
    });

  store.set(pendingKey, { value: promise, expiresAt: now + ttlMs, generation });
  return promise;
}

/**
 * Wraps a read function with both cache layers.
 * Arguments become part of the key, so per-slug and per-filter reads stay correct.
 */
export function cachedRead<TArgs extends unknown[], TResult>(
  namespace: string,
  ttlMs: number,
  load: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  const memoised = (...args: TArgs) =>
    remember(`${namespace}:${JSON.stringify(args)}`, ttlMs, () => load(...args));
  return cache(memoised) as (...args: TArgs) => Promise<TResult>;
}

/** Cache stats — surfaced by /api/health so "is the cache working" is measurable. */
export function cacheStats() {
  const now = Date.now();
  let live = 0;
  for (const [key, entry] of store) {
    if (!key.startsWith("pending:") && entry.expiresAt > now && entry.generation === generation) live += 1;
  }
  return { entries: live, generation };
}
