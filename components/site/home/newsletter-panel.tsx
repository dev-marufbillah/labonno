import Image from "next/image";
import { NewsletterForm } from "@/components/site/newsletter-form";

export function NewsletterPanel({
  title,
  subtitle,
  image,
  buttonLabel,
}: {
  title: string;
  subtitle: string;
  image: string;
  buttonLabel: string;
}) {
  return (
    <section className="shell pt-12 md:pt-16">
      <div className="relative overflow-hidden rounded-xl bg-cream-200/70">
        <div className="grid items-center gap-6 p-6 sm:p-9 md:grid-cols-[1.15fr_1fr_auto] md:gap-8 lg:p-12">
          <div>
            <p className="label-line text-[9px] text-ink-muted">Be a part of</p>
            <h2 className="mt-2 font-serif text-[30px] leading-none text-ink sm:text-[34px]">{title}</h2>
            <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-ink-muted">{subtitle}</p>
          </div>
          <div className="md:justify-self-start">
            <NewsletterForm buttonLabel={buttonLabel} />
          </div>
          <div className="hidden md:block">
            <div className="relative h-32 w-24 overflow-hidden rounded-t-full rounded-b-md bg-cream-300 lg:h-36 lg:w-28">
              <Image src={image} alt="Labonno atelier" fill sizes="112px" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
