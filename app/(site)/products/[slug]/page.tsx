import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/products";
import { getApprovedReviews } from "@/lib/services/content";
import { getSiteSettings } from "@/lib/services/settings";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductPurchase } from "@/components/site/product-purchase";
import { ProductCard } from "@/components/site/product-card";
import { ReviewForm } from "@/components/site/review-form";
import { RecentlyViewedRail, RecentlyViewedTracker } from "@/components/site/recently-viewed";
import { toCardData } from "@/lib/utils/product-card";
import { effectivePrice, formatDate, formatMoney } from "@/lib/utils/format";
import { SITE } from "@/lib/config/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const title = product.seo?.title || product.name;
  const description = product.seo?.description || product.shortDescription;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images.map((url) => ({ url, alt: product.name })),
    },
    twitter: { card: "summary_large_image", title, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews, settings] = await Promise.all([
    getRelatedProducts(product, 4),
    getApprovedReviews(String(product._id)),
    getSiteSettings(),
  ]);

  const price = effectivePrice(product);
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    image: product.images.map((image) => `${SITE.url}${image}`),
    brand: { "@type": "Brand", name: "LABONNO" },
    aggregateRating: product.reviewCount
      ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/products/${product.slug}`,
      priceCurrency: "BDT",
      price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const collectionNames = product.collections;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RecentlyViewedTracker
        item={{ slug: product.slug, name: product.name, image: product.images[0], price }}
      />

      <div className="shell py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-1.5 text-[10.5px] uppercase tracking-wide2 text-ink-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <span aria-hidden>/</span>
          <Link href={`/category/${product.category}`} className="capitalize hover:text-ink">
            {product.category.replace(/-/g, " ")}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:pt-2">
            <p className="label-line text-[9px]">{product.collections[0]?.replace(/-/g, " ") || "Labonno"}</p>
            <h1 className="mt-3 font-serif text-3xl font-light leading-tight md:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(product.rating) ? "size-3.5 fill-gold text-gold" : "size-3.5 text-line"}
                    strokeWidth={1}
                  />
                ))}
              </span>
              <span className="text-[11.5px] text-ink-muted">
                {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </span>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{product.shortDescription}</p>

            <div className="mt-6">
              <ProductPurchase product={toCardData(product)} />
            </div>

            <dl className="mt-8 divide-y divide-line border-y border-line text-[12.5px]">
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-ink-muted">Category</dt>
                <dd className="capitalize">{product.category.replace(/-/g, " ")}</dd>
              </div>
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-ink-muted">Collections</dt>
                <dd className="text-right capitalize">{collectionNames.join(", ").replace(/-/g, " ") || "—"}</dd>
              </div>
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-ink-muted">Material</dt>
                <dd className="text-right">{product.material || "—"}</dd>
              </div>
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-ink-muted">Delivery</dt>
                <dd className="max-w-[60%] text-right">{settings.shipping.deliveryEstimate}</dd>
              </div>
            </dl>

            <div className="mt-8 space-y-5">
              <details className="group border-b border-line pb-4" open>
                <summary className="cursor-pointer list-none font-serif text-lg marker:hidden">
                  Description
                  <span className="float-right text-ink-muted transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-3 text-[13.5px] leading-[1.85] text-ink-soft">
                  {product.description.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </details>
              <details className="group border-b border-line pb-4">
                <summary className="cursor-pointer list-none font-serif text-lg marker:hidden">
                  Fabric & care
                  <span className="float-right text-ink-muted transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-ink-soft">
                  <p><strong className="font-medium text-ink">Material:</strong> {product.material || "See garment label"}</p>
                  <p>{product.careInstructions}</p>
                </div>
              </details>
              <details className="group border-b border-line pb-4">
                <summary className="cursor-pointer list-none font-serif text-lg marker:hidden">
                  Delivery & returns
                  <span className="float-right text-ink-muted transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-ink-soft">
                  <p>{settings.shipping.deliveryEstimate}. Free delivery on orders over {formatMoney(settings.shipping.freeShippingThreshold)}.</p>
                  <p>
                    Returns accepted within {settings.shipping.returnWindowDays} days of delivery. See our{" "}
                    <Link href="/return-policy" className="text-gold-dark underline underline-offset-4">return policy</Link>.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <section className="shell pt-10">
        <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-serif text-2xl">Reviews</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-serif text-4xl">{product.rating.toFixed(1)}</span>
              <div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={i < Math.round(product.rating) ? "size-3.5 fill-gold text-gold" : "size-3.5 text-line"} strokeWidth={1} />
                  ))}
                </div>
                <p className="text-[11.5px] text-ink-muted">{reviews.length} approved reviews</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[12.5px] leading-relaxed text-ink-muted">
              Reviews are left by verified clients and published after moderation. We never edit review content.
            </p>
          </div>

          <div className="space-y-5">
            {reviews.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line p-6 text-[13px] text-ink-muted">
                No reviews yet. If you own this piece, we would love to hear how it fits.
              </p>
            ) : (
              <ul className="space-y-5">
                {reviews.map((review) => (
                  <li key={String(review._id)} className="border-b border-line pb-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-serif text-[15px]">{review.title}</p>
                      <div className="flex shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={i < review.rating ? "size-3 fill-gold text-gold" : "size-3 text-line"} strokeWidth={1} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{review.body}</p>
                    <p className="mt-2 text-[10.5px] uppercase tracking-wide2 text-ink-muted">
                      {review.author} · {formatDate(review.createdAt)}
                      {review.verifiedPurchase ? " · Verified purchase" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <ReviewForm productId={String(product._id)} productSlug={product.slug} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="shell pt-16">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-xl sm:text-2xl">You may also love</h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 gap-y-8 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={String(item._id)} product={toCardData(item)} />
            ))}
          </div>
        </section>
      )}

      <Suspense fallback={null}>
        <RecentlyViewedRail excludeSlug={product.slug} />
      </Suspense>
    </>
  );
}
