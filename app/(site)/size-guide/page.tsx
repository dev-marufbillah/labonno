import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/services/content";
import { PageHeader } from "@/components/site/page-header";

export const metadata: Metadata = {
  title: "Size guide",
  description: "LABONNO garment measurements in inches, with a guide to measuring yourself correctly.",
  alternates: { canonical: "/size-guide" },
};

export default async function SizeGuidePage() {
  const page = await getPageBySlug("size-guide");
  if (!page) notFound();
  return (
    <>
      <PageHeader eyebrow="Fit" title={page.title} description={page.excerpt} breadcrumbs={[{ label: "Size guide" }]} />
      <article className="shell max-w-3xl py-10 md:py-14">
        <div className="prose-luxe" dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
    </>
  );
}
