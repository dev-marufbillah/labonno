"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function MediaUploader() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", "library");
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
      }
      toast.success("Uploaded to the media library");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-label text-cream disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
        {busy ? "Uploading" : "Upload media"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => upload(event.target.files)} />
      <p className="text-[11px] text-ink-muted">JPG, PNG, WEBP, AVIF or SVG · up to 8 MB each</p>
    </div>
  );
}
