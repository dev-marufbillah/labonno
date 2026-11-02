import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/services/content";
import { getSiteSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/site/page-header";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact the LABONNO studio in Banani, Dhaka for orders, fittings and made-to-measure enquiries.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug("contact"), getSiteSettings()]);
  if (!page) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Client care"
        title="Talk to the studio"
        description="Order questions, fittings, made-to-measure and press — one team answers everything."
        breadcrumbs={[{ label: "Contact" }]}
      />
      <div className="shell grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <div className="prose-luxe" dangerouslySetInnerHTML={{ __html: page.content }} />
          <div className="mt-8 space-y-3 border-t border-line pt-6 text-[12.5px] text-ink-soft">
            <p><span className="label mr-2">WhatsApp</span> {settings.general.whatsapp}</p>
            <p><span className="label mr-2">Hours</span> Sunday–Thursday, 11am–7pm</p>
            <p><span className="label mr-2">Studio</span> {settings.general.address}</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-line">
            <iframe
              title="LABONNO studio location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=90.395%2C23.780%2C90.412%2C23.793&amp;layer=mapnik&amp;marker=23.7865%2C90.4035"
              className="h-56 w-full grayscale-[0.3]"
              loading="lazy"
            />
          </div>
        </div>
        <div className="card-surface p-6 md:p-8">
          <h2 className="font-serif text-2xl">Send a message</h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">We reply within one business day.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
