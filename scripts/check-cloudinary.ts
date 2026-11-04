import "./load-env";
import { mongoClient } from "../lib/db/mongo";
import { uploadMedia, listMedia, deleteMedia, cloudinaryConfigured, cloudinaryCredentials } from "../lib/services/media";

/**
 * Proves the Cloudinary credentials in .env.local work — `npm run check:cloudinary`.
 *
 * Uploads a 1×1 PNG to <folder>/_checks, prints the delivery URL, then deletes it again so
 * nothing is left behind on the account. Safe to run any time.
 */
async function main() {
  console.log("configured:", cloudinaryConfigured());
  console.log("cloud:", cloudinaryCredentials()?.cloudName ?? "—");

  // 1x1 transparent PNG
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const file = new File([bytes], "labonno-credential-check.png", { type: "image/png" });

  const result = await uploadMedia(file, "_checks");
  console.log("upload ok:", result.ok, "| url:", result.url ?? result.message);

  if (result.ok && result.media?._id) {
    const listed = await listMedia(5);
    console.log("media library has:", listed.length, "| newest:", listed[0]?.url);
    const removed = await deleteMedia(String(result.media._id));
    console.log("cleanup:", removed.ok, removed.message);
  }

  await mongoClient.close();
}

main().catch(async (error) => {
  console.error("FAILED:", error?.message ?? error);
  await mongoClient.close().catch(() => {});
});
