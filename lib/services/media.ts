import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { col } from "@/lib/db/mongo";
import type { MediaDoc } from "@/lib/db/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
const MAX_BYTES = 8 * 1024 * 1024;

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

export interface UploadResult {
  ok: boolean;
  url?: string;
  message?: string;
  media?: MediaDoc;
}

/**
 * Uploads media to Cloudinary when credentials exist, otherwise stores the file in
 * /public/uploads so local development and previews work without external services.
 */
export async function uploadMedia(file: File, folder = "products"): Promise<UploadResult> {
  if (!file || typeof file === "string") return { ok: false, message: "No file received." };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Unsupported file type. Use JPG, PNG, WEBP, AVIF or SVG." };
  }
  if (file.size > MAX_BYTES) return { ok: false, message: "File is larger than 8 MB." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-60);

  let url: string;
  let publicId: string | undefined;

  if (cloudinaryConfigured()) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const uploaded = await new Promise<{ secure_url: string; public_id: string; width: number; height: number; bytes: number }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `${process.env.CLOUDINARY_UPLOAD_FOLDER || "labonno"}/${folder}`,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
            else
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
              });
          }
        );
        stream.end(buffer);
      }
    );
    url = uploaded.secure_url;
    publicId = uploaded.public_id;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
    await writeFile(path.join(dir, fileName), buffer);
    url = `/uploads/${folder}/${fileName}`;
    publicId = undefined;
  }

  const media: MediaDoc = {
    url,
    publicId,
    alt: file.name.replace(/\.[^.]+$/, ""),
    folder,
    bytes: file.size,
    createdAt: new Date(),
  };
  await col<MediaDoc>("media").insertOne(media);
  return { ok: true, url, media };
}

export async function listMedia(limit = 120): Promise<MediaDoc[]> {
  return col<MediaDoc>("media").find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}
