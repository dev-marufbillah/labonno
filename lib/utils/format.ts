const bdt = new Intl.NumberFormat("en-BD", {
  style: "decimal",
  maximumFractionDigits: 0,
});

/** Formats a number as Bangladeshi Taka, e.g. 4250 -> "৳4,250". */
export function formatMoney(amount: number): string {
  return `৳${bdt.format(Math.round(amount))}`;
}

export function formatNumber(value: number): string {
  return bdt.format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function effectivePrice(product: { price: number; salePrice?: number | null }): number {
  return product.salePrice && product.salePrice > 0 && product.salePrice < product.price
    ? product.salePrice
    : product.price;
}

export function discountPercent(product: { price: number; salePrice?: number | null }): number | null {
  if (!product.salePrice || product.salePrice <= 0 || product.salePrice >= product.price) return null;
  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, max = 140): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
