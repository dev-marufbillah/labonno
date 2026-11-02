"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { Role } from "@/lib/db/types";
import { audit, fail, requireActor, type ActionState } from "./helpers";

export async function setUserRole(userId: string, role: Role): Promise<ActionState> {
  try {
    const actor = await requireActor("super_admin");
    if (actor.id === userId) return { ok: false, message: "You cannot change your own role." };
    const filter = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { _id: userId };
    const result = await col("user").updateOne(filter as never, { $set: { role, updatedAt: new Date() } });
    if (result.matchedCount === 0) return { ok: false, message: "User not found." };
    await audit(actor.email, "user.role", `user:${userId}`, { role });
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { ok: true, message: `Role updated to ${role.replace("_", " ")}.` };
  } catch (error) {
    return fail(error);
  }
}
