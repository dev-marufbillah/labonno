import type { Metadata } from "next";
import { ensureHomepageSections, getHomepageSections, getHeroBanners } from "@/lib/services/content";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { getHomepageProducts, getProductsByIds } from "@/lib/services/products";
import { getSiteSettings } from "@/lib/services/settings";
import { formatMoney } from "@/lib/utils/format";
import { listActiveCoupons } from "@/lib/services/coupons";
import { HeroCarousel, type HeroSlide } from "@/components/site/home/hero";
import { Reveal } from "@/components/ui/reveal";
import { CategoryArches } from "@/components/site/home/category-arches";
import { FeaturedCollection } from "@/components/site/home/featured-collection";
import { ProductGridSection } from "@/components/site/home/product-grid-section";
import { NewsletterPanel } from "@/components/site/home/newsletter-panel";
import { EditorialSection } from "@/components/site/home/editorial";
import { OfferStrip, type OfferCard } from "@/components/site/home/offers";
import type { HomepageSectionDoc } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const brand = settings.general.brandName;
  return {
    title: { absolute: `${brand} — ${settings.general.tagline}` },
    description: settings.seo.defaultDescription,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [initialSections, banners, categories, collections, products, settings, coupons] =
    await Promise.all([
      getHomepageSections(),
      getHeroBanners(),
      getCategories(),
      getCollections(),
      getHomepageProducts(),
      getSiteSettings(),
      listActiveCoupons(3),
    ]);
  let sections = initialSections;

  /**
   * A database with no sections used to render "The homepage is being styled" — which
   * looks like a broken site. Now the shipped sections are put back and the page is
   * rendered normally; the owner can hide or reorder them from Admin → Homepage.
   */
  if (sections.length === 0) {
    const added = await ensureHomepageSections();
    if (added > 0) sections = await getHomepageSections();
  }

  // Product ids chosen by hand in Admin → Homepage (one fetch covers every section).
  const handpickedIds = sections
    .filter((section) => section.type === "product_grid")
    .flatMap((section) => (Array.isArray(section.data?.productIds) ? (section.data.productIds as string[]) : []));
  const handpickedProducts = handpickedIds.length ? await getProductsByIds(handpickedIds) : [];

  const offers: OfferCard[] = coupons.map((coupon) => ({
    code: coupon.code,
    description: coupon.description || "A quiet thank-you on your first order.",
    label:
      coupon.type === "percentage"
        ? `${coupon.value}% off`
        : `${formatMoney(coupon.value)} off`,
    minSubtotal: coupon.minSubtotal ?? 0,
  }));

  const visibleCategories = categories.filter((c) => c.showOnHome);

  const slides: HeroSlide[] =
    banners.length > 0
      ? banners.map((b) => ({
          title: b.title,
          subtitle: b.subtitle,
          eyebrow: b.eyebrow,
          image: b.image,
          mobileImage: b.mobileImage,
          ctaLabel: b.ctaLabel,
          ctaHref: b.ctaHref,
          align: b.align,
        }))
      : [
          {
            title: "Elevate Your Style",
            subtitle: "with Labonno",
            eyebrow: "New arrivals",
            image: "/images/hero-1.jpg",
            ctaLabel: "Shop the look",
            ctaHref: "/shop",
          },
        ];

  function renderSection(section: HomepageSectionDoc) {
    const data = (section.data ?? {}) as Record<string, unknown>;
    const str = (key: string, fallback = "") => (typeof data[key] === "string" ? (data[key] as string) : fallback);

    switch (section.type) {
      case "hero":
        return <HeroCarousel key={section.key} slides={slides} autoPlay={data.autoPlay !== false} />;

      case "category_arches": {
        const slugs = Array.isArray(data.categorySlugs) ? (data.categorySlugs as string[]) : [];
        const list = slugs.length
          ? (slugs.map((slug) => visibleCategories.find((c) => c.slug === slug)).filter(Boolean) as typeof visibleCategories)
          : visibleCategories;
        return (
          <CategoryArches
            key={section.key}
            categories={list}
            limit={typeof data.limit === "number" ? data.limit : 4}
            showSeeAll={data.seeAll !== false}
            seeAllHref={typeof data.seeAllHref === "string" && data.seeAllHref ? data.seeAllHref : "/categories"}
          />
        );
      }

      case "featured_collection": {
        const slug = str("collectionSlug");
        const collection = collections.find((c) => c.slug === slug);
        return (
          <FeaturedCollection
            key={section.key}
            eyebrow={section.title || "Featured collection"}
            title={str("headline", collection?.name ?? "Timeless Elegance")}
            subtitle={str("subtitle", collection?.tagline ?? "")}
            image={str("image", collection?.image ?? "/images/collection-featured.jpg")}
            ctaLabel={str("ctaLabel", "Explore collection")}
            ctaHref={str("ctaHref", slug ? `/collections/${slug}` : "/collections")}
          />
        );
      }

      case "product_grid": {
        const source = str("source", "bestSellers");
        const limit = typeof data.limit === "number" ? data.limit : 4;
        const handpicked = Array.isArray(data.productIds) ? (data.productIds as string[]) : [];
        const byId = new Map(handpickedProducts.map((item) => [String(item._id), item]));
        const pool =
          source === "handpicked"
            ? (handpicked.map((id) => byId.get(id)).filter(Boolean) as typeof products.featured)
            : source === "newArrivals"
              ? products.newArrivals
              : source === "featured"
                ? products.featured
                : products.bestSellers;
        return (
          <ProductGridSection
            key={section.key}
            eyebrow={str("eyebrow")}
            title={section.title}
            subtitle={section.subtitle}
            products={pool.slice(0, limit)}
            ctaLabel={str("ctaLabel", "View all")}
            ctaHref={str("ctaHref", source === "newArrivals" ? "/shop?sort=newest" : "/shop")}
            background={data.background === true}
          />
        );
      }

      case "offers":
        return (
          <OfferStrip
            key={section.key}
            offers={offers}
            title={section.title || "Codes of the season"}
            subtitle={section.subtitle}
          />
        );

      case "editorial":
        return (
          <EditorialSection
            key={section.key}
            eyebrow={str("eyebrow", "The house")}
            title={section.title}
            body={str("body", section.subtitle)}
            image={str("image", "/images/cat-tops.jpg")}
            ctaLabel={str("ctaLabel", "Our story")}
            ctaHref={str("ctaHref", "/about")}
            imagePosition={str("imagePosition", "right") === "left" ? "left" : "right"}
          />
        );

      case "newsletter":
        return (
          <NewsletterPanel
            key={section.key}
            title={settings.newsletter.title || section.title}
            subtitle={settings.newsletter.subtitle || section.subtitle}
            image={settings.newsletter.image}
            buttonLabel={settings.newsletter.buttonLabel}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="pb-4">
      {sections.map((section) =>
        section.type === "hero" ? (
          renderSection(section)
        ) : (
          <Reveal key={`reveal-${section.key}`}>{renderSection(section)}</Reveal>
        )
      )}
      {sections.length === 0 ? (
        <div className="shell py-24 text-center">
          <h1 className="display-2">LABONNO</h1>
          <p className="mt-3 text-ink-muted">
            The homepage has no sections yet. Open <span className="text-ink">Admin → Homepage</span> (or run{" "}
            <code className="rounded bg-cream-200/70 px-1.5 py-0.5 text-[12px]">npm run seed</code>) and they will appear here.
          </p>
        </div>
      ) : null}
    </div>
  );
}
