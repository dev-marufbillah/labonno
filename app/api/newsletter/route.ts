import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/lib/services/content";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 422 });
    }
    const result = await addSubscriber(parsed.data.email, "storefront");
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not subscribe right now" }, { status: 500 });
  }
}
