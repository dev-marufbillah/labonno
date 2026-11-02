import type { PageDoc } from "@/lib/db/types";
import { PageHeader } from "./page-header";

export function LegalPage({ page, breadcrumb }: { page: PageDoc; breadcrumb?: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Client care"
        title={page.title}
        description={page.excerpt}
        breadcrumbs={[{ label: breadcrumb ?? "Information" }]}
        align="left"
      />
      <article className="shell max-w-3xl py-10 md:py-14">
        <div className="prose-luxe" dangerouslySetInnerHTML={{ __html: page.content }} />
        <p className="mt-10 border-t border-line pt-5 text-[11px] uppercase tracking-wide2 text-ink-muted">
          Last updated {new Date(page.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </article>
    </>
  );
}
