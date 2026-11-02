"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import { productSchema, categorySchema, collectionSchema } from "@/lib/validations";
import type { CategoryDoc, CollectionDoc, ProductDoc } from "@/lib/db/types";
import { slugify } from "@/lib/utils/format";
import { audit, fail, requireActor, type ActionState } from "./helpers";

function revalidateCatalogue(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidatePath("/collections");
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
}

export async function saveProduct(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])
        ),
      };
    }
    const data = parsed.data;
    const products = col<ProductDoc>("products");
    const duplicate = await products.findOne({ slug: data.slug, ...(id ? { _id: { $ne: new ObjectId(id) } } : {}) });
    if (duplicate) return { ok: false, message: "Another product already uses that slug." };

    const stock = data.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const payload: Omit<ProductDoc, "_id" | "createdAt"> = {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      shortDescription: data.shortDescription,
      description: data.description,
      category: data.category,
      collections: data.collections,
      images: data.images,
      price: data.price,
      salePrice: data.salePrice ?? null,
      sizes: data.sizes,
      colors: data.colors,
      variants: data.variants.map((variant) => ({
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        ...(variant.price ? { price: variant.price } : {}),
        ...(variant.salePrice ? { salePrice: variant.salePrice } : {}),
      })),
      stock,
      material: data.material,
      careInstructions: data.careInstructions,
      tags: data.tags,
      featured: data.featured,
      newArrival: data.newArrival,
      bestSeller: data.bestSeller,
      status: data.status,
      seo: {
        title: data.seo?.title || `${data.name} — LABONNO`,
        description: data.seo?.description || data.shortDescription,
        keywords: data.seo?.keywords ?? data.tags,
      },
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
      updatedAt: new Date(),
    };

    if (id) {
      const existing = await products.findOne({ _id: new ObjectId(id) });
      if (!existing) return { ok: false, message: "Product not found." };
      await products.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...payload,
            rating: existing.rating,
            reviewCount: existing.reviewCount,
            soldCount: existing.soldCount,
          },
        }
      );
      await col("inventory_logs").insertOne({
        productId: id,
        productName: data.name,
        sku: data.sku,
        change: stock - existing.stock,
        previousStock: existing.stock,
        newStock: stock,
        reason: "product.update",
        actor: actor.email,
        createdAt: new Date(),
      });
      await audit(actor.email, "product.update", `product:${id}`, { slug: data.slug });
    } else {
      await products.insertOne({ ...payload, createdAt: new Date() } as ProductDoc);
      await audit(actor.email, "product.create", `product:${data.slug}`);
    }

    revalidateCatalogue(data.slug);
    return { ok: true, message: id ? "Product updated." : "Product created." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProduct(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid product." };
    await col<ProductDoc>("products").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "product.delete", `product:${id}`);
    revalidateCatalogue();
    return { ok: true, message: "Product deleted." };
  } catch (error) {
    return fail(error);
  }
}

export async function setProductFlags(
  id: string,
  flags: Partial<Pick<ProductDoc, "featured" | "newArrival" | "bestSeller" | "status">>
): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid product." };
    await col<ProductDoc>("products").updateOne({ _id: new ObjectId(id) }, { $set: { ...flags, updatedAt: new Date() } });
    await audit(actor.email, "product.flags", `product:${id}`, flags);
    revalidateCatalogue();
    return { ok: true, message: "Product updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function adjustStock(id: string, size: string, color: string, change: number): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid product." };
    const product = await col<ProductDoc>("products").findOne({ _id: new ObjectId(id) });
    if (!product) return { ok: false, message: "Product not found." };
    const variant = product.variants.find((item) => item.size === size && item.color === color);
    if (!variant) return { ok: false, message: "Variant not found." };
    const next = Math.max(0, variant.stock + change);

    await col<ProductDoc>("products").updateOne(
      { _id: new ObjectId(id), variants: { $elemMatch: { size, color } } },
      {
        $inc: { stock: next - variant.stock },
        $set: { "variants.$.stock": next, updatedAt: new Date() },
      }
    );
    await col("inventory_logs").insertOne({
      productId: id,
      productName: product.name,
      sku: variant.sku,
      change: next - variant.stock,
      previousStock: variant.stock,
      newStock: next,
      reason: "manual.adjustment",
      actor: actor.email,
      createdAt: new Date(),
    });
    await audit(actor.email, "inventory.adjust", `product:${id}`, { size, color, change });
    revalidateCatalogue(product.slug);
    return { ok: true, message: `Stock updated to ${next}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function saveCategory(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Please check the category fields.",
        fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])),
      };
    }
    const data = parsed.data;
    const categories = col<CategoryDoc>("categories");
    const payload = { ...data, slug: slugify(data.slug), updatedAt: new Date() };
    if (id) {
      await categories.updateOne({ _id: new ObjectId(id) }, { $set: payload });
      await audit(actor.email, "category.update", `category:${id}`);
    } else {
      const exists = await categories.findOne({ slug: payload.slug });
      if (exists) return { ok: false, message: "That category slug already exists." };
      await categories.insertOne({ ...payload, createdAt: new Date() } as CategoryDoc);
      await audit(actor.email, "category.create", `category:${payload.slug}`);
    }
    revalidateCatalogue();
    revalidatePath("/categories");
    return { ok: true, message: id ? "Category updated." : "Category created." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCategory(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const category = await col<CategoryDoc>("categories").findOne({ _id: new ObjectId(id) });
    if (!category) return { ok: false, message: "Category not found." };
    const inUse = await col<ProductDoc>("products").countDocuments({ category: category.slug });
    if (inUse > 0) return { ok: false, message: `${inUse} product(s) still use this category. Move them first.` };
    await col<CategoryDoc>("categories").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "category.delete", `category:${id}`);
    revalidateCatalogue();
    return { ok: true, message: "Category deleted." };
  } catch (error) {
    return fail(error);
  }
}

export async function saveCollection(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = collectionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Please check the collection fields.",
        fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])),
      };
    }
    const data = parsed.data;
    const collections = col<CollectionDoc>("collections");
    const payload = { ...data, slug: slugify(data.slug), updatedAt: new Date() };
    if (id) {
      await collections.updateOne({ _id: new ObjectId(id) }, { $set: payload });
      await audit(actor.email, "collection.update", `collection:${id}`);
    } else {
      const exists = await collections.findOne({ slug: payload.slug });
      if (exists) return { ok: false, message: "That collection slug already exists." };
      await collections.insertOne({ ...payload, createdAt: new Date() } as CollectionDoc);
      await audit(actor.email, "collection.create", `collection:${payload.slug}`);
    }
    revalidateCatalogue();
    revalidatePath("/collections");
    return { ok: true, message: id ? "Collection updated." : "Collection created." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCollection(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const collection = await col<CollectionDoc>("collections").findOne({ _id: new ObjectId(id) });
    if (!collection) return { ok: false, message: "Collection not found." };
    await col<CollectionDoc>("collections").deleteOne({ _id: new ObjectId(id) });
    await col<ProductDoc>("products").updateMany({}, { $pull: { collections: collection.slug } } as never);
    await audit(actor.email, "collection.delete", `collection:${id}`);
    revalidateCatalogue();
    return { ok: true, message: "Collection deleted and unlinked from products." };
  } catch (error) {
    return fail(error);
  }
}
