import type { Metadata } from "next";
import Image from "next/image";
import { listMedia, cloudinaryConfigured } from "@/lib/services/media";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaDeleteButton } from "@/components/admin/media-delete-button";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Media library" };

export default async function AdminMediaPage() {
  const media = await listMedia();
  const cloudinary = cloudinaryConfigured();

  return (
    <div>
      <AdminPageTitle
        title="Media library"
        description={cloudinary ? "Images are stored on Cloudinary and served through next/image." : "Cloudinary is not configured — uploads are stored locally in /public/uploads."}
      />
      <Panel>
        <div className="mb-5">
          <MediaUploader />
        </div>
        {media.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-10 text-center text-[12.5px] text-ink-muted">
            No media uploaded yet. Upload a banner or product image to get started.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {media.map((item) => (
              <li key={String(item._id)} className="overflow-hidden rounded-lg border border-line bg-cream">
                <div className="relative aspect-square bg-cream-200">
                  <Image src={item.url} alt={item.alt} fill sizes="200px" className="object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-[11px] text-ink">{item.alt}</p>
                  <p className="text-[9.5px] uppercase tracking-wide2 text-ink-muted">{item.folder} · {formatDate(item.createdAt)}</p>
                  <input
                    readOnly
                    value={item.url}
                    onFocus={(event) => event.currentTarget.select()}
                    className="mt-1.5 w-full rounded border border-line bg-white/70 px-1.5 py-1 text-[9.5px] text-ink-muted"
                  />
                  <MediaDeleteButton id={String(item._id)} url={item.url} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
