"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { saveSettings } from "@/lib/actions/content";
import { Input, Label } from "@/components/ui/input";

interface LinkRow {
  label: string;
  href: string;
}
interface HeaderRow extends LinkRow {
  children: string; // "Label|href" per line
}
interface ColumnRow {
  title: string;
  links: string;
}

export function NavigationEditor({
  header,
  footer,
  social,
}: {
  header: { label: string; href: string; children: { label: string; href: string }[] }[];
  footer: { title: string; links: { label: string; href: string }[] }[];
  social: { platform: string; href: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [headerRows, setHeaderRows] = React.useState<HeaderRow[]>(
    header.map((item) => ({ label: item.label, href: item.href, children: item.children.map((c) => `${c.label}|${c.href}`).join("\n") }))
  );
  const [footerRows, setFooterRows] = React.useState<ColumnRow[]>(
    footer.map((column) => ({ title: column.title, links: column.links.map((l) => `${l.label}|${l.href}`).join("\n") }))
  );
  const [socialRows, setSocialRows] = React.useState<LinkRow[]>(
    social.map((item) => ({ label: item.platform, href: item.href }))
  );

  const parse = (raw: string) =>
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((part) => part.trim());
        return { label: label ?? "", href: href ?? "/" };
      });

  const submit = async () => {
    setBusy(true);
    try {
      const result = await saveSettings({
        navigation: {
          header: headerRows
            .filter((row) => row.label && row.href)
            .map((row) => ({ label: row.label, href: row.href, children: parse(row.children) })),
          footer: footerRows
            .filter((row) => row.title)
            .map((row) => ({ title: row.title, links: parse(row.links) })),
          social: socialRows.filter((row) => row.label && row.href).map((row) => ({ platform: row.label, href: row.href })),
        },
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-cream-50/80">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2 className="font-serif text-lg">Header navigation</h2>
            <p className="text-[11.5px] text-ink-muted">Top-level links and their dropdown menus.</p>
          </div>
          <button
            type="button"
            onClick={() => setHeaderRows((prev) => [...prev, { label: "", href: "", children: "" }])}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
          >
            <Plus className="size-3" /> Add link
          </button>
        </header>
        <div className="space-y-3 p-5">
          {headerRows.map((row, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-line/70 p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
              <div>
                <Label>Label</Label>
                <Input value={row.label} onChange={(e) => setHeaderRows((prev) => prev.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} />
              </div>
              <div>
                <Label>Link</Label>
                <Input value={row.href} onChange={(e) => setHeaderRows((prev) => prev.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)))} />
              </div>
              <div>
                <Label>Dropdown (Label|/url per line)</Label>
                <textarea
                  value={row.children}
                  onChange={(e) => setHeaderRows((prev) => prev.map((item, i) => (i === index ? { ...item, children: e.target.value } : item)))}
                  rows={2}
                  className="w-full rounded-md border border-line bg-white/70 px-2.5 py-2 font-mono text-[11px] outline-none focus:border-gold"
                />
              </div>
              <button
                type="button"
                onClick={() => setHeaderRows((prev) => prev.filter((_, i) => i !== index))}
                aria-label="Remove link"
                className="mt-5 grid size-9 place-items-center self-start rounded-md border border-line text-ink-muted hover:border-red-300 hover:text-red-700"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-cream-50/80">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2 className="font-serif text-lg">Footer columns</h2>
            <p className="text-[11.5px] text-ink-muted">Each column accepts one “Label|/url” pair per line.</p>
          </div>
          <button
            type="button"
            onClick={() => setFooterRows((prev) => [...prev, { title: "", links: "" }])}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[10px] uppercase tracking-wide2 hover:border-ink"
          >
            <Plus className="size-3" /> Add column
          </button>
        </header>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {footerRows.map((row, index) => (
            <div key={index} className="rounded-lg border border-line/70 p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Column title</Label>
                  <Input value={row.title} onChange={(e) => setFooterRows((prev) => prev.map((item, i) => (i === index ? { ...item, title: e.target.value } : item)))} />
                </div>
                <button
                  type="button"
                  onClick={() => setFooterRows((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="Remove column"
                  className="grid size-9 place-items-center rounded-md border border-line text-ink-muted hover:border-red-300 hover:text-red-700"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="mt-2">
                <Label>Links</Label>
                <textarea
                  rows={4}
                  value={row.links}
                  onChange={(e) => setFooterRows((prev) => prev.map((item, i) => (i === index ? { ...item, links: e.target.value } : item)))}
                  className="w-full rounded-md border border-line bg-white/70 px-2.5 py-2 font-mono text-[11px] outline-none focus:border-gold"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-cream-50/80">
        <header className="border-b border-line px-5 py-3.5">
          <h2 className="font-serif text-lg">Social links</h2>
        </header>
        <div className="grid gap-2 p-5 sm:grid-cols-3">
          {socialRows.map((row, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="w-28">
                <Label>Platform</Label>
                <Input value={row.label} onChange={(e) => setSocialRows((prev) => prev.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} />
              </div>
              <div className="flex-1">
                <Label>URL</Label>
                <Input value={row.href} onChange={(e) => setSocialRows((prev) => prev.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)))} />
              </div>
              <button
                type="button"
                onClick={() => setSocialRows((prev) => prev.filter((_, i) => i !== index))}
                aria-label="Remove social link"
                className="grid size-9 place-items-center rounded-md border border-line text-ink-muted hover:border-red-300 hover:text-red-700"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-line px-5 py-3">
          <button type="button" onClick={() => setSocialRows((prev) => [...prev, { label: "", href: "" }])} className="text-[10px] uppercase tracking-wide2 text-gold-dark">
            + Add social link
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream disabled:opacity-60"
      >
        {busy ? <><Loader2 className="size-3 animate-spin" /> Saving</> : "Save navigation"}
      </button>
    </div>
  );
}
