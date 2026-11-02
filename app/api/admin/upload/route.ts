import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/guards";
import { uploadMedia } from "@/lib/services/media";

export async function POST(request: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "No upload received" }, { status: 400 });
  const file = form.get("file");
  const folder = String(form.get("folder") || "products");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file found" }, { status: 400 });

  const result = await uploadMedia(file, folder);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
  return NextResponse.json({ url: result.url, media: result.media });
}
