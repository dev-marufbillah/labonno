import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { ensureHomepageSections, getAllHomepageSections } from "@/lib/services/content";
import { getCollections } from "@/lib/services/catalog";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/action-button";
import { SectionEditor } from "@/components/admin/section-editor";
import { moveSection, toggleSection } from "@/lib/actions/content";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Homepage builder" };

export default async function AdminHomepagePage() {
  await ensureHomepageSections();
  const [sections, collections] = await Promise.all([getAllHomepageSections(), getCollections({ includeHidden: true })]);

  return (
    <div>
      <AdminPageTitle
        title="Homepage builder"
        description="Show, hide, reorder and edit every section of the storefront homepage."
        action={
          <Link href="/" className="rounded-full border border-line px-5 py-2.5 text-[10px] uppercase tracking-label text-ink hover:border-ink">
            Preview homepage
          </Link>
        }
      />

      <Panel title="Sections" description="Order controls the vertical position on the homepage.">
        <ul className="divide-y divide-line">
          {sections.map((section, index) => (
            <li key={section.key} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-cream-200 text-[10px] text-ink-soft">{index + 1}</span>
                  <p className="truncate text-[13px] font-medium text-ink">{section.label}</p>
                  {section.visible ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {section.type.replace(/_/g, " ")} · {section.title || "untitled"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <ActionButton
                  action={async () => moveSection(section.key, "up")}
                  label={<ArrowUp className="size-3" />}
                  variant="subtle"
                  size="icon"
                />
                <ActionButton
                  action={async () => moveSection(section.key, "down")}
                  label={<ArrowDown className="size-3" />}
                  variant="subtle"
                  size="icon"
                />
                <ActionButton
                  action={async () => toggleSection(section.key, !section.visible)}
                  label={section.visible ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  variant="subtle"
                  size="icon"
                />
                <SectionEditor
                  section={section}
                  collections={collections.map((collection) => ({ slug: collection.slug, name: collection.name }))}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
