"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function MediaDeleteButton({ id, url }: { id: string; url: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <button
      type="button"
      aria-label="Delete image"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm("Delete this image? Any page still using it will lose the picture.")) return;
        setBusy(true);
        const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
        setBusy(false);
        if (data.ok) {
          toast.success(data.message ?? "Image deleted");
          router.refresh();
        } else {
          toast.error(data.error ?? data.message ?? "Could not delete that image");
        }
      }}
      className="mt-2 inline-flex items-center gap-1 text-[9.5px] uppercase tracking-wide2 text-ink-muted transition hover:text-red-700 disabled:opacity-50"
      title={url}
    >
      <Trash2 className="size-3" /> Delete
    </button>
  );
}
