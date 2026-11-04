"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { OrderDoc, OrderStatus, PaymentStatus } from "@/lib/db/types";
import { getOrderById, updateOrderStatus, updatePaymentStatus } from "@/lib/services/orders";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "@/lib/email/order-email";
import { audit, fail, requireActor, type ActionState } from "./helpers";

export async function setOrderStatus(id: string, status: OrderStatus, note?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid order." };
    const result = await updateOrderStatus(id, status, note, actor.email);
    if (!result.ok) return { ok: false, message: result.message };
    await audit(actor.email, "order.status", `order:${id}`, { status, note });

    // Tell the customer. Fire-and-forget: a mail hiccup must never fail the status change.
    const order = await getOrderById(id);
    if (order) void sendOrderStatusUpdate(order, status).catch(() => {});
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/account/orders");
    return { ok: true, message: result.message };
  } catch (error) {
    return fail(error);
  }
}

/** Re-sends the order confirmation email — handy when a customer says it never arrived. */
export async function resendOrderEmail(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!ObjectId.isValid(id)) return { ok: false, message: "Invalid order." };
    const order = await getOrderById(id);
    if (!order) return { ok: false, message: "Order not found." };

    const result = await sendOrderConfirmation(order);
    if (result.skipped) {
      return { ok: false, message: "Email is not configured yet — add RESEND_API_KEY and EMAIL_FROM to .env.local." };
    }
    if (!result.ok) return { ok: false, message: result.error ?? "The email could not be sent." };

    await col<OrderDoc>("orders").updateOne({ _id: order._id }, { $set: { confirmationEmailAt: new Date() } as never });
    await audit(actor.email, "order.email", `order:${id}`, { to: order.customer.email });
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true, message: `Confirmation sent to ${order.customer.email}.` };
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
