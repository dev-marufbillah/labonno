import Image from "next/image";
import Link from "next/link";

/**
 * Editorial band for the listing pages. A photograph, one line of copy and a couple of
 * quiet facts — enough to make /shop feel like a page from a lookbook rather than a
 * database table.
 */
export function ShopHero({
  eyebrow,
  title,
  description,
  image,
  facts = [],
  breadcrumbs = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  facts?: { label: string; value: string }[];
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="shell pt-4 md:pt-6">
      <div className="relative overflow-hidden rounded-lg bg-cream-200 md:rounded-xl">
        <div className="relative h-[300px] w-full sm:h-[360px] lg:h-[420px]">
          <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover object-[60%_center] md:object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/70 to-cream/10 md:via-cream/50 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-7 sm:px-10 sm:pb-9 lg:px-14 lg:pb-12">
            {breadcrumbs.length ? (
              <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[9.5px] uppercase tracking-label text-ink-soft/80">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.label} className="flex items-center gap-2">
                    {crumb.href ? (
                      <Link href={crumb.href} className="link-underline">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-ink">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 ? <span aria-hidden>/</span> : null}
                  </span>
                ))}
              </nav>
            ) : null}
            <p className="label-line text-[9px] sm:text-[9.5px]">{eyebrow}</p>
            <h1 className="mt-3 max-w-2xl font-serif text-[30px] font-light leading-[1.03] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[52px]">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-ink-soft sm:text-[13px]">{description}</p>

            {facts.length ? (
              <dl className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline gap-2">
                    <dt className="text-[9px] uppercase tracking-label text-ink-soft/80">{fact.label}</dt>
                    <dd className="font-serif text-[15px] text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
