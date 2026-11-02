"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";

export function ImageField({
  label,
  value,
  onChange,
  hint,
  folder = "products",
  multiple = false,
}: {
  label: string;
  value: string | string[];
  onChange: (value: string[]) => void;
  hint?: string;
  folder?: string;
  multiple?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const [manual, setManual] = React.useState("");
  const images = Array.isArray(value) ? value : value ? [value] : [];
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 8)) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
        uploaded.push(data.url);
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addManual = () => {
    if (!manual.trim()) return;
    onChange(multiple ? [...images, manual.trim()] : [manual.trim()]);
    setManual("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-wide2 text-ink-soft">{label}</label>
      <div className="flex flex-wrap gap-2">
        {images.map((image) => (
          <div key={image} className="group relative size-20 overflow-hidden rounded-md border border-line bg-cream-200">
            <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((item) => item !== image))}
              aria-label="Remove image"
              className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="grid size-20 place-items-center rounded-md border border-dashed border-line text-ink-muted transition hover:border-gold hover:text-gold-dark"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.4} />}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(event) => upload(event.target.files)}
      />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-md border border-line bg-white/70 px-2">
          <Link2 className="size-3 text-ink-muted" />
          <input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addManual();
              }
            }}
            placeholder="Or paste an image URL"
            className="h-8 w-full bg-transparent text-[11.5px] outline-none"
          />
        </div>
        <button type="button" onClick={addManual} className="h-8 rounded-md border border-line px-3 text-[10px] uppercase tracking-wide2 hover:border-ink">
          Add
        </button>
      </div>
      {hint ? <p className="mt-1 text-[10.5px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}
