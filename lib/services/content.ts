import "server-only";
import { col } from "@/lib/db/mongo";
import type { BannerDoc, HomepageSectionDoc, PageDoc, ReviewDoc, SubscriberDoc } from "@/lib/db/types";

export async function getHomepageSections(): Promise<HomepageSectionDoc[]> {
  return col<HomepageSectionDoc>("homepage_sections").find({ visible: true }).sort({ order: 1 }).toArray();
}

export async function getAllHomepageSections(): Promise<HomepageSectionDoc[]> {
  return col<HomepageSectionDoc>("homepage_sections").find({}).sort({ order: 1 }).toArray();
}

export async function getHeroBanners(): Promise<BannerDoc[]> {
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

export async function getPromoBanners(): Promise<BannerDoc[]> {
  return col<BannerDoc>("banners").find({ placement: "promo", visible: true }).sort({ order: 1 }).toArray();
}

export async function getAllBanners(): Promise<BannerDoc[]> {
  return col<BannerDoc>("banners").find({}).sort({ placement: 1, order: 1 }).toArray();
}

export async function getPageBySlug(slug: string): Promise<PageDoc | null> {
  return col<PageDoc>("content_pages").findOne({ slug, published: true });
}

export async function getAllPages(): Promise<PageDoc[]> {
  return col<PageDoc>("content_pages").find({}).sort({ title: 1 }).toArray();
}

export async function getFooterPages(): Promise<PageDoc[]> {
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

export async function getFaqs(): Promise<import("@/lib/db/types").FaqDoc[]> {
  return col<import("@/lib/db/types").FaqDoc>("faqs").find({ visible: true }).sort({ order: 1 }).toArray();
}

export async function getAllFaqs() {
  return col<import("@/lib/db/types").FaqDoc>("faqs").find({}).sort({ order: 1 }).toArray();
}
