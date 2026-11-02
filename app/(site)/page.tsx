import type { Metadata } from "next";
import { getHomepageSections, getHeroBanners } from "@/lib/services/content";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { getHomepageProducts } from "@/lib/services/products";
import { getSiteSettings } from "@/lib/services/settings";
import { HeroCarousel, type HeroSlide } from "@/components/site/home/hero";
import { CategoryArches } from "@/components/site/home/category-arches";
import { FeaturedCollection } from "@/components/site/home/featured-collection";
import { ProductGridSection } from "@/components/site/home/product-grid-section";
import { NewsletterPanel } from "@/components/site/home/newsletter-panel";
import { EditorialSection } from "@/components/site/home/editorial";
import type { HomepageSectionDoc } from "@/lib/db/types";

export const metadata: Metadata = {
  title: "LABONNO — The Art of Elegance",
  description:
    "Discover handcrafted sarees, three-piece sets, dresses and accessories from LABONNO, a Dhaka-based luxury fashion house. Made in limited runs.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [sections, banners, categories, collections, products, settings] = await Promise.all([
    getHomepageSections(),
    getHeroBanners(),
    getCategories(),
    getCollections(),
    getHomepageProducts(),
    getSiteSettings(),
  ]);

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
          ? slugs.map((slug) => visibleCategories.find((c) => c.slug === slug)).filter(Boolean)
          : visibleCategories;
        return <CategoryArches key={section.key} categories={list as typeof visibleCategories} />;
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
        const pool =
          source === "newArrivals"
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
      {sections.map(renderSection)}
      {sections.length === 0 ? (
        <div className="shell py-24 text-center">
          <h1 className="display-2">LABONNO</h1>
          <p className="mt-3 text-ink-muted">The homepage is being styled. Please check back shortly.</p>
        </div>
      ) : null}
    </div>
  );
}
