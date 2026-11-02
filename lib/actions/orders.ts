"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { OrderDoc, OrderStatus, PaymentStatus } from "@/lib/db/types";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/services/orders";
import { audit, fail, requireActor, type ActionState } from "./helpers";

export async function setOrderStatus(id: string, status: OrderStatus, note?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid order." };
    const result = await updateOrderStatus(id, status, note, actor.email);
    if (!result.ok) return { ok: false, message: result.message };
    await audit(actor.email, "order.status", `order:${id}`, { status, note });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/account/orders");
    return { ok: true, message: result.message };
  } catch (error) {
    return fail(error);
  }
}

export async function setPaymentStatus(id: string, status: PaymentStatus): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid order." };
    const result = await updatePaymentStatus(id, status, actor.email);
    if (!result.ok) return { ok: false, message: result.message };
    await audit(actor.email, "order.payment", `order:${id}`, { status });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { ok: true, message: result.message };
  } catch (error) {
    return fail(error);
  }
}

export async function saveOrderNote(id: string, note: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid order." };
    await col<OrderDoc>("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { customerNote: note.slice(0, 500), updatedAt: new Date() } }
    );
    await audit(actor.email, "order.note", `order:${id}`);
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true, message: "Note saved." };
  } catch (error) {
    return fail(error);
  }
}
