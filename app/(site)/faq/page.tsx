import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/lib/services/content";
import { PageHeader } from "@/components/site/page-header";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about sizing, made-to-order pieces, delivery, payments and returns at LABONNO.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const categories = [...new Set(faqs.map((faq) => faq.category))];

  return (
    <>
      <PageHeader
        eyebrow="Client care"
        title="Frequently asked questions"
        description="Sizing, made-to-order timelines, delivery across Bangladesh, payments and returns."
        breadcrumbs={[{ label: "FAQ" }]}
      />
      <div className="shell max-w-3xl py-10 md:py-14">
        {categories.map((category) => (
          <section key={category} className="mb-10">
            <h2 className="label-line mb-2 text-[9.5px]">{category}</h2>
            <Accordion type="single" collapsible>
              {faqs
                .filter((faq) => faq.category === category)
                .map((faq) => (
                  <AccordionItem key={String(faq._id)} value={String(faq._id)} question={faq.question} answer={faq.answer} />
                ))}
            </Accordion>
          </section>
        ))}
        {faqs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-[13px] text-ink-muted">
            Our FAQ is being updated. Contact the studio and we will answer personally.
          </p>
        ) : null}
        <div className="mt-8 rounded-xl bg-cream-200/60 p-6 text-center">
          <p className="font-serif text-xl">Still have a question?</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">Our studio replies within one business day, Sunday–Thursday.</p>
          <Link href="/contact" className="mt-4 inline-block rounded-full bg-ink px-7 py-3 text-[10px] uppercase tracking-label text-cream">
            Contact us
          </Link>
        </div>
      </div>
    </>
  );
}
