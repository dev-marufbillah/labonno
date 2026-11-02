import "server-only";
import { col } from "@/lib/db/mongo";
import { getCurrentUser, isAdminRole } from "@/lib/auth/server";
import type { AuditLogDoc, Role } from "@/lib/db/types";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

export const idleState: ActionState = { ok: false, message: "" };

export class ActionError extends Error {}

/**
 * Every administrative server action funnels through this guard. The role is read
 * from the Better Auth session on the server — never from client input.
 */
export async function requireActor(minRole: Role = "admin") {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    throw new ActionError("You do not have permission to perform this action.");
  }
  if (minRole === "super_admin" && user.role !== "super_admin") {
    throw new ActionError("Only a super admin can perform this action.");
  }
  return user;
}

export async function audit(actor: string, action: string, target: string, meta?: Record<string, unknown>) {
  const entry: AuditLogDoc = {
    actorId: "",
    actorEmail: actor,
    action,
    target,
    meta,
    createdAt: new Date(),
  };
  await col<AuditLogDoc>("audit_logs").insertOne(entry);
}

export function fail(error: unknown): ActionState {
  if (error instanceof ActionError) return { ok: false, message: error.message };
  console.error("admin action failed", error);
  return { ok: false, message: "Something went wrong. Please try again." };
}
