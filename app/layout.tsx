import type { Metadata, Viewport } from "next";
import { sans, serif } from "./fonts";
import { Toaster } from "sonner";
import { SITE } from "@/lib/config/site";
import { CommerceProvider } from "@/components/site/commerce-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "LABONNO — The Art of Elegance",
    template: "%s · LABONNO",
  },
  description: SITE.description,
  keywords: [
    "luxury fashion bangladesh",
    "designer saree dhaka",
    "three piece set",
    "handcrafted couture",
    "LABONNO",
  ],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: "LABONNO — The Art of Elegance",
    description: SITE.description,
    images: [{ url: "/images/hero-1.jpg", width: 1376, height: 768, alt: "LABONNO couture" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LABONNO — The Art of Elegance",
    description: SITE.description,
    images: ["/images/hero-1.jpg"],
  },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <CommerceProvider>{children}</CommerceProvider>
        <Toaster
          position="bottom-right"
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
