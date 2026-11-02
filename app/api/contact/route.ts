import { NextResponse } from "next/server";
import { col } from "@/lib/db/mongo";
import { contactSchema } from "@/lib/validations";
import type { ContactMessageDoc } from "@/lib/db/types";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your message" }, { status: 422 });
  }
  const doc: ContactMessageDoc = { ...parsed.data, phone: parsed.data.phone || "", status: "new", createdAt: new Date() };
  await col<ContactMessageDoc>("contact_messages").insertOne(doc);
  return NextResponse.json({ message: "Message sent — our studio will reply within one business day." }, { status: 201 });
}
