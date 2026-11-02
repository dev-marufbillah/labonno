import "server-only";
import { type Filter, type Sort } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { ProductDoc } from "@/lib/db/types";
import { effectivePrice } from "@/lib/utils/format";

export interface ProductQuery {
  category?: string;
  collection?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sort?: string;
  page?: number;
  perPage?: number;
  status?: "published" | "all";
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  onSale?: boolean;
}

export interface ProductListResult {
  products: ProductDoc[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  priceBounds: { min: number; max: number };
}

const SORTS: Record<string, Sort> = {
  newest: { createdAt: -1 },
  "price-asc": { salePrice: 1, price: 1 },
  "price-desc": { price: -1 },
  featured: { featured: -1, createdAt: -1 },
  bestselling: { soldCount: -1, createdAt: -1 },
  rating: { rating: -1 },
};

function normaliseFilter(q: ProductQuery): Filter<ProductDoc> {
  const filter: Filter<ProductDoc> = {};
  if (q.status !== "all") filter.status = "published";
  if (q.category) filter.category = q.category;
  if (q.collection) filter.collections = q.collection;
  if (q.featured) filter.featured = true;
  if (q.newArrival) filter.newArrival = true;
  if (q.bestSeller) filter.bestSeller = true;
  if (q.onSale) filter.salePrice = { $ne: null, $gt: 0 };
  if (q.sizes?.length) filter.sizes = { $in: q.sizes };
  if (q.colors?.length) filter["colors.name"] = { $in: q.colors };
  if (typeof q.minPrice === "number" || typeof q.maxPrice === "number") {
    filter.$or = [
      { salePrice: { $gte: q.minPrice ?? 0, $lte: q.maxPrice ?? Number.MAX_SAFE_INTEGER, $gt: 0 } },
      { salePrice: null, price: { $gte: q.minPrice ?? 0, $lte: q.maxPrice ?? Number.MAX_SAFE_INTEGER } },
    ];
  }
  if (q.search) {
    const term = q.search.trim();
    if (term) {
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const searchClause = [
        { name: rx },
        { shortDescription: rx },
        { tags: rx },
        { category: rx },
        { sku: rx },
      ];
      filter.$and = [{ $or: searchClause }];
    }
  }
  return filter;
}

export async function listProducts(q: ProductQuery = {}): Promise<ProductListResult> {
  const page = Math.max(1, q.page ?? 1);
  const perPage = Math.min(60, Math.max(4, q.perPage ?? 12));
  const filter = normaliseFilter(q);
  const productsCol = col<ProductDoc>("products");

  const [products, total, bounds] = await Promise.all([
    productsCol
      .find(filter)
      .sort(SORTS[q.sort || "newest"] ?? SORTS.newest)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    productsCol.countDocuments(filter),
    productsCol
      .aggregate<{ _id: null; min: number; max: number }>([
        { $match: { status: "published" } },
        {
          $group: {
            _id: null,
            min: { $min: { $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"] } },
            max: { $max: "$price" },
          },
        },
      ])
      .toArray(),
  ]);

  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    priceBounds: {
      min: Math.floor(bounds[0]?.min ?? 0),
      max: Math.ceil(bounds[0]?.max ?? 20000),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDoc | null> {
  return col<ProductDoc>("products").findOne({ slug, status: "published" });
}

export async function getProductById(id: string): Promise<ProductDoc | null> {
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(id)) return null;
  return col<ProductDoc>("products").findOne({ _id: new ObjectId(id) });
}

export async function getRelatedProducts(product: ProductDoc, limit = 4): Promise<ProductDoc[]> {
  return col<ProductDoc>("products")
    .find({
      status: "published",
      _id: { $ne: product._id },
      $or: [{ category: product.category }, { collections: { $in: product.collections } }],
    })
    .limit(limit)
    .toArray();
}

export async function getHomepageProducts(): Promise<{
  bestSellers: ProductDoc[];
  newArrivals: ProductDoc[];
  featured: ProductDoc[];
}> {
  const productsCol = col<ProductDoc>("products");
  const [bestSellers, newArrivals, featured] = await Promise.all([
    productsCol.find({ status: "published", bestSeller: true }).sort({ soldCount: -1, createdAt: -1 }).limit(8).toArray(),
    productsCol.find({ status: "published", newArrival: true }).sort({ createdAt: -1 }).limit(8).toArray(),
    productsCol.find({ status: "published", featured: true }).sort({ createdAt: -1 }).limit(8).toArray(),
  ]);
  return { bestSellers, newArrivals, featured };
}

export async function getProductsByIds(ids: string[]): Promise<ProductDoc[]> {
  const { ObjectId } = await import("mongodb");
  const valid = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (!valid.length) return [];
  return col<ProductDoc>("products").find({ _id: { $in: valid } }).toArray();
}

/** Server-side price lookup used by cart/checkout so client prices are never trusted. */
export async function resolveVariantPrice(productId: string, size: string, color: string) {
  const product = await getProductById(productId);
  if (!product || product.status !== "published") return null;
  const variant = product.variants.find((v) => v.size === size && v.color === color);
  return {
    product,
    variant: variant ?? null,
    unitPrice: effectivePrice(product),
    stock: variant?.stock ?? product.stock,
  };
}
