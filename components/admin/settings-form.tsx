"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveSettings } from "@/lib/actions/content";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "./image-field";

export interface SettingsField {
  path: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "toggle" | "image" | "tel" | "email";
  hint?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
}

function readPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function writePath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let cursor = target;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  });
}

export function SettingsForm({
  title,
  description,
  group,
  values,
  fields,
  folder = "settings",
}: {
  title: string;
  description?: string;
  group: string;
  values: Record<string, unknown>;
  fields: SettingsField[];
  folder?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [state, setState] = React.useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of fields) initial[field.path] = readPath(values, field.path) ?? "";
    return initial;
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const patchGroup: Record<string, unknown> = {};
      for (const field of fields) {
        const key = field.path.replace(`${group}.`, "");
        writePath(patchGroup, key, state[field.path]);
      }
      const result = await saveSettings({ [group]: patchGroup } as never);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Could not save settings");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-cream-50/80">
      <header className="border-b border-line px-5 py-3.5">
        <h2 className="font-serif text-lg">{title}</h2>
        {description ? <p className="text-[11.5px] text-ink-muted">{description}</p> : null}
      </header>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {fields.map((field) => {
          const value = state[field.path];
          const set = (next: unknown) => setState((prev) => ({ ...prev, [field.path]: next }));

          if (field.type === "image") {
            return (
              <div key={field.path} className={field.full ? "sm:col-span-2" : ""}>
                <ImageField
                  label={field.label}
                  value={typeof value === "string" ? value : ""}
                  onChange={(next) => set(next[0] ?? "")}
                  folder={folder}
                />
                {field.hint ? <p className="mt-1 text-[10.5px] text-ink-muted">{field.hint}</p> : null}
              </div>
            );
          }

          if (field.type === "toggle") {
            return (
              <div key={field.path} className="flex items-center justify-between rounded-md bg-cream-200/50 px-3 py-2.5">
                <span className="text-[11.5px] text-ink-soft">{field.label}</span>
                <Switch checked={Boolean(value)} onCheckedChange={set} />
              </div>
            );
          }

          return (
            <div key={field.path} className={field.full || field.type === "textarea" ? "sm:col-span-2" : ""}>
              <Label>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea rows={4} value={String(value ?? "")} onChange={(event) => set(event.target.value)} />
              ) : field.type === "select" ? (
                <Select value={String(value ?? "")} onChange={(event) => set(event.target.value)}>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  type={field.type === "number" ? "number" : field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
                  value={String(value ?? "")}
                  onChange={(event) => set(field.type === "number" ? Number(event.target.value) : event.target.value)}
                />
              )}
              {field.hint ? <p className="mt-1 text-[10.5px] text-ink-muted">{field.hint}</p> : null}
            </div>
          );
        })}
      </div>
      <div className="border-t border-line px-5 py-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream disabled:opacity-60"
        >
          {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save changes"}
        </button>
      </div>
    </form>
  );
}
