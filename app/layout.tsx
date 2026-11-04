import type { Metadata, Viewport } from "next";
import { sans, serif } from "./fonts";
import { Toaster } from "sonner";
import { SITE } from "@/lib/config/site";
import { getSiteSettings } from "@/lib/services/settings";
import { hexToHslTriplet } from "@/lib/utils/color";
import { CommerceProvider } from "@/components/site/commerce-provider";
import "./globals.css";

/**
 * Metadata is generated from the CMS so that renaming the brand, changing the
 * tagline, SEO defaults or the favicon in Admin → Settings is reflected across
 * the whole site — including page titles — without a deploy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const brand = settings.general.brandName || SITE.name;
  const title = settings.seo.defaultTitle || `${brand} — ${settings.general.tagline}`;
  const description = settings.seo.defaultDescription || SITE.description;
  const favicon = settings.appearance.favicon || "/favicon.svg";

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: settings.seo.titleTemplate || `%s · ${brand}`,
    },
    description,
    keywords: [
      "luxury fashion bangladesh",
      "designer saree dhaka",
      "three piece set",
      "handcrafted couture",
      brand,
    ],
    applicationName: brand,
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: SITE.url,
      siteName: brand,
      title,
      description,
      images: [{ url: "/images/hero-1.jpg", width: 1376, height: 768, alt: `${brand} couture` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero-1.jpg"],
    },
    icons: { icon: favicon, apple: favicon },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const accent = hexToHslTriplet(settings.appearance.accentColor);

  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
      style={{ "--accent": accent, "--ring": accent } as React.CSSProperties}
    >
      <body>
        <CommerceProvider>{children}</CommerceProvider>
        <Toaster
          position="bottom-right"
          mobileOffset={{ bottom: 86 }}
          toastOptions={{
            style: {
              background: "#1E1D1A",
              color: "#FAF6F0",
              border: "1px solid #3A362F",
              borderRadius: "6px",
              fontSize: "13px",
              letterSpacing: "0.01em",
            },
          }}
        />
      </body>
    </html>
  );
}
