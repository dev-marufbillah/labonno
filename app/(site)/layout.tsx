import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Analytics } from "@/components/site/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteSettings } from "@/lib/services/settings";
import { SITE } from "@/lib/config/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const general = settings.general;

  // Organization + site search: what Google shows for brand searches.
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: general.brandName || SITE.name,
      alternateName: general.brandNameBn,
      url: SITE.url,
      logo: `${SITE.url}${settings.appearance.logoImage || "/images/logo.png"}`,
      description: general.tagline,
      email: general.email,
      telephone: general.phone,
      address: { "@type": "PostalAddress", streetAddress: general.address, addressCountry: "BD" },
      sameAs: [general.whatsapp ? `https://wa.me/${general.whatsapp.replace(/[^0-9]/g, "")}` : null].filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: general.brandName || SITE.name,
      url: SITE.url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <JsonLd data={structured} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Analytics />
    </div>
  );
}
