import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/services/content";
import { LegalPage } from "@/components/site/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("terms");
  return {
    title: page?.title ?? "Information",
    description: page?.excerpt ?? "",
    alternates: { canonical: "/terms" },
  };
}

export default async function Page() {
  const page = await getPageBySlug("terms");
  if (!page) notFound();
  return <LegalPage page={page} breadcrumb={page.title} />;
}
