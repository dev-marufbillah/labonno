/**
 * Structured data helper. Google reads these to show prices, ratings and breadcrumbs
 * directly in search results — the biggest organic-traffic win for a shop.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Built from our own database, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
