import type { ProductDoc } from "@/lib/db/types";

export interface ProductCardData {
  _id?: unknown;
  name: string;
  slug: string;
  images: string[];
  price: number;
  salePrice?: number | null;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  variants?: { size: string; color: string; stock: number; sku: string }[];
  stock?: number;
  newArrival?: boolean;
  sku?: string;
}

/** Trims a Mongo product document down to what a product card needs. */
export function toCardData(product: ProductDoc): ProductCardData {
  return {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    images: product.images,
    price: product.price,
    salePrice: product.salePrice ?? null,
    sizes: product.sizes,
    colors: product.colors,
    variants: product.variants?.map((v) => ({ size: v.size, color: v.color, stock: v.stock, sku: v.sku })),
    stock: product.stock,
    newArrival: product.newArrival,
    sku: product.sku,
  };
}
