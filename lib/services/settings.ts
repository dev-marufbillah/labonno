import "server-only";
import { col } from "@/lib/db/mongo";
import type { SiteSettingsDoc } from "@/lib/db/types";
import { SITE } from "@/lib/config/site";

export const defaultSettings: SiteSettingsDoc = {
  _id: "site",
  general: {
    brandName: "LABONNO",
    brandNameBn: "লাবণ্য",
    tagline: "The Art of Elegance",
    announcement: "Free shipping across Bangladesh on orders over ৳2,000 · Handcrafted couture",
    email: SITE.email,
    phone: SITE.phone,
    whatsapp: "+8801700000000",
    address: SITE.address,
    currency: "BDT",
    currencySymbol: "৳",
    openGraphImage: "/images/hero-1.jpg",
  },
  appearance: {
    logoText: "LABONNO",
    logoImage: "",
    favicon: "/favicon.svg",
    accentColor: "#A9906B",
    serifFont: "Cormorant Garamond",
    sansFont: "Jost",
  },
  navigation: {
    header: [
      {
        label: "Shop",
        href: "/shop",
        children: [
          { label: "Shop all", href: "/shop" },
          { label: "Saree", href: "/category/saree" },
          { label: "Three piece", href: "/category/three-piece" },
          { label: "Dresses", href: "/category/dresses" },
          { label: "Tops", href: "/category/tops" },
          { label: "Bottoms", href: "/category/bottoms" },
          { label: "Bags & accessories", href: "/category/accessories" },
        ],
      },
      {
        label: "Collections",
        href: "/collections",
        children: [
          { label: "Timeless Elegance", href: "/collections/timeless-elegance" },
          { label: "Black Zari", href: "/collections/black-zari" },
          { label: "Sage Fest", href: "/collections/sage-fest" },
          { label: "Velvet Luxe", href: "/collections/velvet-luxe" },
        ],
      },
      { label: "New Arrivals", href: "/shop?sort=newest", children: [] },
      { label: "About", href: "/about", children: [] },
    ],
    footer: [
      {
        title: "Shop",
        links: [
          { label: "Shop all", href: "/shop" },
          { label: "Categories", href: "/categories" },
          { label: "Collections", href: "/collections" },
          { label: "New arrivals", href: "/shop?sort=newest" },
        ],
      },
      {
        title: "Client care",
        links: [
          { label: "Contact", href: "/contact" },
          { label: "FAQ", href: "/faq" },
          { label: "Size guide", href: "/size-guide" },
          { label: "Track order", href: "/track-order" },
        ],
      },
      {
        title: "Policies",
        links: [
          { label: "Shipping policy", href: "/shipping-policy" },
          { label: "Return & refund", href: "/return-policy" },
          { label: "Privacy policy", href: "/privacy-policy" },
          { label: "Terms & conditions", href: "/terms" },
        ],
      },
    ],
    social: [
      { platform: "instagram", href: "https://instagram.com" },
      { platform: "facebook", href: "https://facebook.com" },
      { platform: "tiktok", href: "https://tiktok.com" },
    ],
  },
  payments: {
    cod: { enabled: true, instructions: "Pay in cash when your order is delivered. Available nationwide." },
    bkash: {
      enabled: true,
      number: "01711 000 000",
      instructions:
        "Send the total to our bKash merchant number, then enter your bKash number and transaction ID below. We verify every payment manually.",
    },
    nagad: {
      enabled: true,
      number: "01711 000 000",
      instructions:
        "Send the total to our Nagad merchant number, then enter your Nagad number and transaction ID below. We verify every payment manually.",
    },
    sslcommerz: {
      enabled: false,
      instructions: "Card and mobile banking payments are processed securely through SSLCommerz.",
    },
  },
  shipping: {
    defaultCharge: 120,
    freeShippingThreshold: 2000,
    insideDhakaCharge: 80,
    outsideDhakaCharge: 150,
    zones: [],
    deliveryEstimate: "Inside Dhaka 2–3 days · Outside Dhaka 3–5 days",
    returnWindowDays: 7,
  },
  newsletter: {
    title: "Be a part of Labonno",
    subtitle: "Get the latest trends & exclusive offers straight from our studio.",
    image: "/images/newsletter.jpg",
    buttonLabel: "Subscribe",
  },
  seo: {
    defaultTitle: "LABONNO — The Art of Elegance",
    titleTemplate: "%s · LABONNO",
    defaultDescription:
      "Handcrafted luxury womenswear from Dhaka: sarees, three-piece sets, dresses and accessories made in limited runs.",
    keywords: ["luxury fashion bangladesh", "designer saree", "three piece", "labonno", "handcrafted couture"],
  },
  updatedAt: new Date(),
};

/** Returns the single site-settings document, falling back to seeded defaults. */
export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  try {
    const doc = await col<SiteSettingsDoc>("site_settings").findOne({ _id: "site" });
    if (!doc) return defaultSettings;
    return {
      ...defaultSettings,
      ...doc,
      general: { ...defaultSettings.general, ...doc.general },
      appearance: { ...defaultSettings.appearance, ...doc.appearance },
      navigation: { ...defaultSettings.navigation, ...doc.navigation },
      payments: { ...defaultSettings.payments, ...doc.payments },
      shipping: { ...defaultSettings.shipping, ...doc.shipping },
      newsletter: { ...defaultSettings.newsletter, ...doc.newsletter },
      seo: { ...defaultSettings.seo, ...doc.seo },
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSiteSettings(updates: Partial<SiteSettingsDoc>, actor?: string) {
  const current = await getSiteSettings();
  const next: SiteSettingsDoc = {
    ...current,
    ...updates,
    _id: "site",
    updatedAt: new Date(),
  };
  await col<SiteSettingsDoc>("site_settings").updateOne({ _id: "site" }, { $set: next }, { upsert: true });
  if (actor) {
    await col("audit_logs").insertOne({
      actorEmail: actor,
      action: "settings.update",
      target: "site_settings",
      meta: { keys: Object.keys(updates) },
      createdAt: new Date(),
    });
  }
  return next;
}

export function shippingChargeFor(district: string, settings: SiteSettingsDoc): number {
  const zone = settings.shipping.zones?.find((z) => z.district.toLowerCase() === district.toLowerCase());
  if (zone) return zone.charge;
  if (!district) return settings.shipping.defaultCharge;
  if (district.toLowerCase() === "dhaka") return settings.shipping.insideDhakaCharge;
  return settings.shipping.outsideDhakaCharge;
}
