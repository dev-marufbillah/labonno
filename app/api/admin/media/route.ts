import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/guards";
import { deleteMedia } from "@/lib/services/media";

/** Removes an uploaded image from Cloudinary (or /public/uploads) and the media library. */
export async function DELETE(request: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Missing media id" }, { status: 400 });

  const result = await deleteMedia(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
