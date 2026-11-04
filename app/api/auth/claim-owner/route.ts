import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { isOwnerEmail } from "@/lib/auth/owners";
import { col } from "@/lib/db/mongo";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/claim-owner
 *
 * Called right after a studio sign-in whose account does not carry an admin role yet.
 * If the signed-in email is one of the owner addresses the role is raised to super
 * admin and the caller is let in; anyone else is told to ask for an invitation.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, reason: "not-signed-in" }, { status: 401 });

  if (user.role === "admin" || user.role === "super_admin") {
    return NextResponse.json({ ok: true, role: user.role });
  }

  if (!(await isOwnerEmail(user.email))) {
    return NextResponse.json({ ok: false, reason: "no-access" }, { status: 403 });
  }

  await col("user").updateOne({ email: user.email.toLowerCase() } as never, {
    $set: { role: "super_admin", updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true, role: "super_admin" });
}
