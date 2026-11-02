import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import { cancelOrderByCustomer } from "@/lib/services/orders";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireApiUser();
  if (error || !user) return error ?? NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { id } = await context.params;
  // Ownership is enforced inside the service — a customer can never cancel another's order.
  const result = await cancelOrderByCustomer(id, user.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
