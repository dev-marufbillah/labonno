import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/services/content";
import { LegalPage } from "@/components/site/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("return-policy");
  return {
    title: page?.title ?? "Information",
    description: page?.excerpt ?? "",
    alternates: { canonical: "/return-policy" },
  };
}

export default async function Page() {
  const page = await getPageBySlug("return-policy");
  if (!page) notFound();
  return <LegalPage page={page} breadcrumb={page.title} />;
}
