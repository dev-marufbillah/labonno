import "server-only";
import { col } from "@/lib/db/mongo";
import { invalidateSiteCache } from "@/lib/services/cache";
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

/**
 * Every successful admin mutation records an audit entry — and clears the storefront
 * read cache, so a saved product/banner/setting is visible on the next request instead
 * of waiting for its TTL. This is the single invalidation point for the whole panel.
 */
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
  invalidateSiteCache();
}

export function fail(error: unknown): ActionState {
  if (error instanceof ActionError) return { ok: false, message: error.message };
  console.error("admin action failed", error);
  return { ok: false, message: "Something went wrong. Please try again." };
}
