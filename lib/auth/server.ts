import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/db/types";
import { createAuth } from "./core";
import { isOwnerEmail } from "./owners";
import { col } from "@/lib/db/mongo";

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
  let role = (user.role as Role) || "customer";

  /**
   * Owner addresses always keep access: if the founder signed up before being
   * listed (or the role was changed by mistake) the next panel visit puts the
   * role back to super admin, permanently.
   */
  if (!isAdminRole(role) && (await isOwnerEmail(user.email))) {
    role = "super_admin";
    try {
      await col("user").updateOne({ email: user.email.toLowerCase() } as never, {
        $set: { role, updatedAt: new Date() },
      });
    } catch {
      /* promotion is best-effort — the session already has access */
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role,
    phone: user.phone ?? null,
  };
});

export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Page guard for anything that needs a signed-in visitor (bag, checkout, wishlist…).
 * Sends anonymous visitors to the login screen and remembers where they were headed,
 * so `?next=` brings them straight back after they sign in or create an account.
 */
export async function requireCustomer(nextPath = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
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
