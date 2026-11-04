import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, ArrowUp } from "lucide-react";
import { getSiteSettings } from "@/lib/services/settings";
import { getFooterPages } from "@/lib/services/content";
import { NewsletterForm } from "./newsletter-form";

const socialIcon: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

export async function SiteFooter() {
  const [settings, footerPages] = await Promise.all([getSiteSettings(), getFooterPages()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-footer text-cream/80">
      <div className="shell py-14">
        <div className="grid gap-10 border-b border-cream/10 pb-12 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            {settings.appearance.logoImage ? (
              <Image
                src={settings.appearance.logoImage}
                alt={settings.general.brandName}
                width={200}
                height={48}
                className="h-11 w-auto object-contain"
              />
            ) : (
              <p className="font-serif text-[26px] tracking-[0.2em] text-cream">{settings.general.brandName}</p>
            )}
            <p className="mt-2 text-[8px] uppercase tracking-[0.4em] text-cream/50">
              Wear your elegance · {settings.general.brandNameBn}
            </p>
            <p className="mt-5 max-w-xs text-[12.5px] leading-relaxed text-cream/60">
              A Dhaka-based luxury fashion house. Handcrafted pieces, made in considered quantities, for women who
              dress with intention.
            </p>
            <div className="mt-5 space-y-1 text-[12px] text-cream/60">
              <p>{settings.general.address}</p>
              <p>
                {settings.general.phone} · {settings.general.email}
              </p>
            </div>
          </div>

          {settings.navigation.footer.map((column) => (
            <div key={column.title}>
              <p className="text-[9.5px] uppercase tracking-label text-cream/45">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link href={link.href} className="text-[12.5px] text-cream/70 transition hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-6 border-b border-cream/10 py-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-serif text-xl text-cream">Join the Labonno circle</p>
            <p className="mt-1 text-[12px] text-cream/55">
              Private previews, new collections and studio notes — no more than twice a month.
            </p>
          </div>
          <NewsletterForm tone="light" buttonLabel="Subscribe" />
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-6 pt-8 md:flex-row">
          <p className="text-[11px] text-cream/45">
            © {year} {settings.general.brandName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-cream/45">
            {footerPages.slice(0, 2).map((page) => (
              <Link key={page.slug} href={`/p/${page.slug}`} className="hover:text-cream">
                {page.title}
              </Link>
            ))}
            <Link href="/privacy-policy" className="hover:text-cream">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-cream">Terms & Conditions</Link>
            <span>Currency (BDT ৳)</span>
          </div>
          <div className="flex items-center gap-4">
            {settings.navigation.social.map((social) => {
              const Icon = socialIcon[social.platform] ?? Instagram;
              return (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="grid size-8 place-items-center rounded-full border border-cream/20 text-cream/70 transition hover:border-cream/50 hover:text-cream"
                >
                  <Icon className="size-3.5" strokeWidth={1.4} />
                </a>
              );
            })}
            <a
              href="#top"
              aria-label="Back to top"
              className="grid size-8 place-items-center rounded-full border border-cream/20 text-cream/70 transition hover:border-cream/50 hover:text-cream"
            >
              <ArrowUp className="size-3.5" strokeWidth={1.4} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
