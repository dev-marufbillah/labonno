import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPages, getPageBySlug } from "@/lib/services/content";
import { LegalPage } from "@/components/site/legal-page";

export async function generateStaticParams() {
  const pages = await getAllPages();
  const reserved = ["about", "faq", "size-guide", "shipping-policy", "return-policy", "privacy-policy", "terms", "contact"];
  return pages.filter((page) => !reserved.includes(page.slug)).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: page.excerpt,
    alternates: { canonical: `/p/${page.slug}` },
    openGraph: { title: `${page.title} · LABONNO`, description: page.excerpt },
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return <LegalPage page={page} breadcrumb={page.title} />;
}
