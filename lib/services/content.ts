import "server-only";
import { cachedRead, TTL } from "./cache";
import { col } from "@/lib/db/mongo";
import type { BannerDoc, HomepageSectionDoc, PageDoc, ReviewDoc, SubscriberDoc } from "@/lib/db/types";

async function read_getHomepageSections(): Promise<HomepageSectionDoc[]> {
  return col<HomepageSectionDoc>("homepage_sections").find({ visible: true }).sort({ order: 1 }).toArray();
}

export async function getAllHomepageSections(): Promise<HomepageSectionDoc[]> {
  return col<HomepageSectionDoc>("homepage_sections").find({}).sort({ order: 1 }).toArray();
}

async function read_getHeroBanners(): Promise<BannerDoc[]> {
  const now = new Date();
  const banners = await col<BannerDoc>("banners")
    .find({
      placement: "home_hero",
      visible: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    })
    .sort({ order: 1 })
    .toArray();
  return banners;
}

async function read_getPromoBanners(): Promise<BannerDoc[]> {
  return col<BannerDoc>("banners").find({ placement: "promo", visible: true }).sort({ order: 1 }).toArray();
}

export async function getAllBanners(): Promise<BannerDoc[]> {
  return col<BannerDoc>("banners").find({}).sort({ placement: 1, order: 1 }).toArray();
}

async function read_getPageBySlug(slug: string): Promise<PageDoc | null> {
  return col<PageDoc>("content_pages").findOne({ slug, published: true });
}

export async function getAllPages(): Promise<PageDoc[]> {
  return col<PageDoc>("content_pages").find({}).sort({ title: 1 }).toArray();
}

async function read_getFooterPages(): Promise<PageDoc[]> {
  return col<PageDoc>("content_pages").find({ published: true, showInFooter: true }).sort({ title: 1 }).toArray();
}

export async function getApprovedReviews(productId: string): Promise<ReviewDoc[]> {
  return col<ReviewDoc>("reviews").find({ productId, status: "approved" }).sort({ createdAt: -1 }).toArray();
}

export async function listReviews(status?: "pending" | "approved" | "rejected") {
  return col<ReviewDoc>("reviews")
    .find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
}

export async function addSubscriber(email: string, source = "footer"): Promise<{ ok: boolean; message: string }> {
  try {
    await col<SubscriberDoc>("subscribers").insertOne({ email: email.toLowerCase().trim(), source, createdAt: new Date() });
    return { ok: true, message: "You are on the list. Welcome to LABONNO." };
  } catch {
    return { ok: true, message: "You are already subscribed." };
  }
}

export async function listSubscribers(): Promise<SubscriberDoc[]> {
  return col<SubscriberDoc>("subscribers").find({}).sort({ createdAt: -1 }).limit(500).toArray();
}

async function read_getFaqs(): Promise<import("@/lib/db/types").FaqDoc[]> {
  return col<import("@/lib/db/types").FaqDoc>("faqs").find({ visible: true }).sort({ order: 1 }).toArray();
}

export async function getAllFaqs() {
  return col<import("@/lib/db/types").FaqDoc>("faqs").find({}).sort({ order: 1 }).toArray();
}

// Storefront reads are cached for a minute; admin mutations call invalidateSiteCache().
/**
 * The homepage as it ships. Used to repair a database whose sections are missing —
 * which is exactly what an empty storefront ("The homepage is being styled") means.
 * Only sections that do not exist yet are added; nothing is overwritten.
 */
export const DEFAULT_HOMEPAGE_SECTIONS: Array<{
  key: string;
  type: string;
  label: string;
  title: string;
  subtitle: string;
  data: Record<string, unknown>;
}> = [
  { key: "hero", type: "hero", label: "Hero carousel", title: "Hero", subtitle: "", data: { autoPlay: true } },
  {
    key: "categories",
    type: "category_arches",
    label: "Shop by category",
    title: "Shop by category",
    subtitle: "",
    data: {},
  },
  {
    key: "featured-collection",
    type: "featured_collection",
    label: "Featured collection",
    title: "Featured collection",
    subtitle: "Pearls, ivory silk and quiet glamour",
    data: {
      headline: "The Festive Edit",
      image: "/images/collection-featured.jpg",
      ctaLabel: "Explore collection",
      ctaHref: "/collections",
    },
  },
  {
    key: "new-arrivals",
    type: "product_grid",
    label: "New arrivals",
    title: "New Arrivals",
    subtitle: "Fresh from the studio this week",
    data: { source: "newArrivals", limit: 4, ctaLabel: "View all", ctaHref: "/shop?sort=newest" },
  },
  {
    key: "best-sellers",
    type: "product_grid",
    label: "Best sellers",
    title: "Best Sellers",
    subtitle: "",
    data: { source: "bestSellers", limit: 4, ctaLabel: "View all", ctaHref: "/shop?sort=bestselling" },
  },
  {
    key: "editorial",
    type: "editorial",
    label: "House editorial",
    title: "Made slowly, in Dhaka",
    subtitle: "",
    data: {
      eyebrow: "The house",
      body: "Every LABONNO piece begins on paper and ends in the hands of an artisan — jamdani weavers in Rupganj, zardozi karigars in Old Dhaka, a small tailoring studio in Banani. Limited runs, nothing rushed.",
      image: "/images/cat-tops.jpg",
      ctaLabel: "Our story",
      ctaHref: "/about",
      imagePosition: "right",
    },
  },
  {
    key: "offers",
    type: "offers",
    label: "Coupon codes",
    title: "Codes of the season",
    subtitle: "Tap a card to copy the code — paste it in the bag or at checkout.",
    data: {},
  },
  {
    key: "newsletter",
    type: "newsletter",
    label: "Newsletter",
    title: "Be a part of Labonno",
    subtitle: "Get the latest trends & exclusive offers straight from our studio.",
    data: {},
  },
];

/**
 * Inserts any homepage section that is missing, keeping the existing order and any
 * hidden ones untouched. Safe to call on every visit to Admin → Homepage: it is how a
 * database with an empty homepage repairs itself without running terminal commands.
 */
export async function ensureHomepageSections(): Promise<number> {
  let added = 0;
  try {
    const existing = await col("homepage_sections").find({}).sort({ order: -1 }).limit(1).next();
    let order = ((existing as { order?: number } | null)?.order ?? 0) + 1;
    const keys = new Set(
      (await col("homepage_sections").find({}).project({ key: 1 }).toArray()).map((row) => String((row as { key?: string }).key))
    );

    for (const section of DEFAULT_HOMEPAGE_SECTIONS) {
      if (keys.has(section.key)) continue;
      await col("homepage_sections").insertOne({
        ...section,
        visible: true,
        // Keep the intended reading order when the page is empty altogether.
        order: keys.size === 0 ? DEFAULT_HOMEPAGE_SECTIONS.indexOf(section) + 1 : order++,
        updatedAt: new Date(),
      } as never);
      added += 1;
    }
  } catch {
    /* a missing section must never break the page */
  }
  return added;
}

/** Kept for older imports: only the offers band. */
export async function ensureOffersSection(): Promise<void> {
  await ensureHomepageSections();
}

export const getHomepageSections = cachedRead("homepage-sections", TTL.content, read_getHomepageSections);
export const getHeroBanners = cachedRead("hero-banners", TTL.content, read_getHeroBanners);
export const getPromoBanners = cachedRead("promo-banners", TTL.content, read_getPromoBanners);
export const getPageBySlug = cachedRead("page", TTL.content, read_getPageBySlug);
export const getFooterPages = cachedRead("footer-pages", TTL.content, read_getFooterPages);
export const getFaqs = cachedRead("faqs", TTL.content, read_getFaqs);
