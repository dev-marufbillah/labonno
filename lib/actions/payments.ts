"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { col } from "@/lib/db/mongo";
import { audit, fail, requireActor, type ActionState } from "./helpers";
import type { PaymentMethodDoc } from "@/lib/db/types";

const configSchema = z
  .object({
    appKey: z.string().trim().max(200).optional(),
    appSecret: z.string().trim().max(200).optional(),
    username: z.string().trim().max(120).optional(),
    password: z.string().trim().max(120).optional(),
    storeId: z.string().trim().max(120).optional(),
    storePassword: z.string().trim().max(120).optional(),
    sandbox: z.boolean().optional(),
  })
  .partial();

const methodSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Give the method a short id")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  label: z.string().trim().min(2, "Enter the name customers will see").max(60),
  kind: z.enum(["manual", "gateway"]),
  enabled: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(999).default(10),
  description: z.string().trim().max(200).default(""),
  instructions: z.string().trim().max(800).default(""),
  number: z.string().trim().max(60).optional(),
  accountType: z.string().trim().max(40).optional(),
  requiresReference: z.boolean().default(false),
  gateway: z.enum(["bkash", "sslcommerz"]).nullish(),
  badge: z.string().trim().max(24).optional(),
  config: configSchema.optional(),
});

function refresh() {
  revalidatePath("/admin/payments");
  revalidatePath("/checkout");
}

export async function savePaymentMethod(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = methodSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the fields" };
    }
    const data = parsed.data;
    const collection = col<PaymentMethodDoc>("payment_methods");

    // The key is what orders store forever, so it must stay unique.
    const clash = await collection.findOne({ key: data.key });
    if (clash && String(clash._id) !== id) {
      return { ok: false, message: `A payment method with the id "${data.key}" already exists.` };
    }

    const now = new Date();
    const doc = {
      key: data.key,
      label: data.label,
      kind: data.kind,
      enabled: data.enabled,
      order: data.order,
      description: data.description,
      instructions: data.instructions,
      number: data.number ?? "",
      accountType: data.accountType ?? "",
      requiresReference: data.kind === "manual" ? data.requiresReference : false,
      gateway: data.kind === "gateway" ? (data.gateway ?? null) : null,
      badge: data.badge ?? "",
      updatedAt: now,
    };

    // Credentials are only written when the owner actually typed something.
    const config = Object.fromEntries(
      Object.entries(data.config ?? {}).filter(([, value]) => value !== undefined && value !== "")
    );

    if (id) {
      const update: Record<string, unknown> = { $set: doc };
      if (Object.keys(config).length > 0) update.$set = { ...doc, config };
      await collection.updateOne({ _id: new ObjectId(id) }, update);
      await audit(actor.email, "payment.update", data.key);
    } else {
      await collection.insertOne({ ...doc, config, createdAt: now } as PaymentMethodDoc);
      await audit(actor.email, "payment.create", data.key);
    }

    refresh();
    return { ok: true, message: id ? "Payment method updated." : `${data.label} added.` };
  } catch (error) {
    return fail(error);
  }
}

export async function togglePaymentMethod(id: string, enabled: boolean): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const collection = col<PaymentMethodDoc>("payment_methods");
    const method = await collection.findOne({ _id: new ObjectId(id) });
    if (!method) return { ok: false, message: "That payment method no longer exists." };

    if (!enabled) {
      const remaining = await collection.countDocuments({ enabled: true, _id: { $ne: new ObjectId(id) } });
      if (remaining === 0) return { ok: false, message: "Keep at least one payment method switched on." };
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { enabled, updatedAt: new Date() } });
    await audit(actor.email, enabled ? "payment.enable" : "payment.disable", method.key);
    refresh();
    return { ok: true, message: `${method.label} ${enabled ? "is now offered" : "is hidden at checkout"}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePaymentMethod(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const collection = col<PaymentMethodDoc>("payment_methods");
    const method = await collection.findOne({ _id: new ObjectId(id) });
    if (!method) return { ok: false, message: "That payment method no longer exists." };
    if (method.enabled) {
      const remaining = await collection.countDocuments({ enabled: true, _id: { $ne: new ObjectId(id) } });
      if (remaining === 0) return { ok: false, message: "Keep at least one payment method switched on." };
    }
    await collection.deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "payment.delete", method.key);
    refresh();
    return { ok: true, message: `${method.label} deleted. Past orders keep their record.` };
  } catch (error) {
    return fail(error);
  }
}

export async function movePaymentMethod(id: string, direction: "up" | "down"): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const collection = col<PaymentMethodDoc>("payment_methods");
    const all = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
    const index = all.findIndex((method) => String(method._id) === id);
    if (index === -1) return { ok: false, message: "That payment method no longer exists." };
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= all.length) return { ok: true, message: "Nothing to move." };

    const current = all[index];
    const neighbour = all[target];
    await collection.updateOne({ _id: current._id }, { $set: { order: target + 1, updatedAt: new Date() } });
    await collection.updateOne({ _id: neighbour._id }, { $set: { order: index + 1, updatedAt: new Date() } });
    await audit(actor.email, "payment.reorder", current.key);
    refresh();
    return { ok: true, message: "Order updated." };
  } catch (error) {
    return fail(error);
  }
}
