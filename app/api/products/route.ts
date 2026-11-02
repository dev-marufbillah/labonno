import { NextResponse } from "next/server";
import { listProducts, getProductsByIds } from "@/lib/services/products";
import { toCardData } from "@/lib/utils/product-card";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (ids) {
    const products = await getProductsByIds(ids.split(",").filter(Boolean).slice(0, 40));
    return NextResponse.json({ products: products.map(toCardData) });
  }

  const result = await listProducts({
    search: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    perPage: Number(searchParams.get("perPage") ?? 12),
  });

  return NextResponse.json({
    products: result.products.map(toCardData),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}
