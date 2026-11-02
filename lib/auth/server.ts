import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/db/types";
import { createAuth } from "./core";

export const auth = createAuth();

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  phone?: string | null;
}

/** Reads the Better Auth session on the server. Memoised per request. */
export const getSession = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  if (!session?.user) return null;
  const user = session.user as typeof session.user & { role?: string; phone?: string };
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: (user.role as Role) || "customer",
    phone: user.phone ?? null,
  };
});

export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

export function isAdminRole(role?: Role | null): boolean {
  return role === "admin" || role === "super_admin";
}

/** Server-side guard for every /admin route and admin API handler. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (user.role !== "super_admin") {
    redirect("/admin/dashboard?error=insufficient-permissions");
  }
  return user;
}
