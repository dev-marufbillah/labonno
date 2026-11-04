import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, isAdminRole } from "./server";
import type { Role } from "@/lib/db/types";

/**
 * API-level guards. These never trust a role supplied by the client — the role is
 * always read from the server-side session record.
 */
export async function requireApiUser(nextPath?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        {
          error: "Please sign in to continue.",
          requiresAuth: true,
          // The browser uses this to bounce the visitor to the right login screen and
          // straight back to where they were going.
          loginUrl: `/login?next=${encodeURIComponent(nextPath ?? "/account")}`,
        },
        { status: 401 }
      ),
    };
  }
  return { user, error: null as null };
}

export async function requireApiAdmin(minRole: Role = "admin") {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (minRole === "super_admin" && user.role !== "super_admin") {
    return { user: null, error: NextResponse.json({ error: "Super admin access required" }, { status: 403 }) };
  }
  return { user, error: null as null };
}
