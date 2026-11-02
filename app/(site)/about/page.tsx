import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/services/content";
import { PageHeader } from "@/components/site/page-header";

export const metadata: Metadata = {
  title: "About us",
  description:
    "LABONNO is a Dhaka-based luxury fashion house working with jamdani weavers, zardozi karigars and a small tailoring studio to make clothes worth keeping.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Made by hand", body: "Jamdani on pit looms, zardozi worked bead by bead. We do not substitute the craft for speed." },
  { title: "Limited runs", body: "Between 20 and 60 pieces per design. When an edit sells out it is not repeated." },
  { title: "Fairly paid", body: "Our karigars are paid per piece at rates agreed with them, directly wherever possible." },
  { title: "Made to last", body: "Natural fibres, generous seam allowances and finishing that survives years of wear." },
];

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page) notFound();

  return (
    <>
      <PageHeader
        eyebrow="The house"
        title="Grace, made slowly"
        description="Founded in Dhaka in 2021, LABONNO designs clothes for women who dress with intention — pieces built on craft rather than trend."
        breadcrumbs={[{ label: "About" }]}
      />

      <section className="shell grid gap-8 py-12 md:grid-cols-2 md:items-center md:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-200">
          <Image src="/images/hero-2.jpg" alt="LABONNO couture" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="prose-luxe" dangerouslySetInnerHTML={{ __html: page.content }} />
      </section>

      <section className="shell py-6">
        <div className="grid gap-6 border-y border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title}>
              <h2 className="font-serif text-xl">{value.title}</h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell grid gap-4 py-8 sm:grid-cols-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-200 sm:aspect-[3/4]">
          <Image src="/images/cat-tops.jpg" alt="Studio rail" fill sizes="33vw" className="object-cover" />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-200 sm:aspect-[3/4]">
          <Image src="/images/product-1.jpg" alt="Embroidery detail" fill sizes="33vw" className="object-cover" />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-200 sm:aspect-[3/4]">
          <Image src="/images/cat-bags.jpg" alt="Accessories" fill sizes="33vw" className="object-cover" />
        </div>
      </section>

      <section className="shell py-10 text-center">
        <h2 className="display-3">Visit the studio</h2>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
          Fittings and made-to-measure appointments are available Sunday to Thursday at our Banani studio.
        </p>
        <Link href="/contact" className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft">
          Book an appointment
        </Link>
      </section>
    </>
  );
}
