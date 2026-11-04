import type { Metadata } from "next";
import Link from "next/link";
import { col } from "@/lib/db/mongo";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { listProducts } from "@/lib/services/products";
import { getCategories, getCollections } from "@/lib/services/catalog";
import { getAllBanners, getAllHomepageSections, getAllPages, getAllFaqs } from "@/lib/services/content";
import { listCoupons } from "@/lib/services/coupons";
import { listPaymentMethods } from "@/lib/services/payment-methods";
import { listMedia } from "@/lib/services/media";
import { listReviews } from "@/lib/services/content";
import { integrationSummary } from "@/lib/config/integrations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Everything on the site" };

interface Area {
  title: string;
  description: string;
  href: string;
  addHref?: string;
  count: number | string;
  unit?: string;
}

async function count(collection: string, filter: Record<string, unknown> = {}) {
  try {
    return await col(collection).countDocuments(filter as never);
  } catch {
    return 0;
  }
}

export default async function AdminSiteMapPage() {
  const [products, categories, collections, banners, sections, pages, faqs, coupons, methods, media, reviews] =
    await Promise.all([
      listProducts({ perPage: 1 } as never),
      getCategories(),
      getCollections(),
      getAllBanners(),
      getAllHomepageSections(),
      getAllPages(),
      getAllFaqs(),
      listCoupons(),
      listPaymentMethods(),
      listMedia(1),
      listReviews(),
    ]);

  const [customers, staffCount, orders, subscribers] = await Promise.all([
    count("user", { role: "customer" }),
    count("user", { role: { $in: ["admin", "super_admin"] } }),
    count("orders"),
    count("subscribers"),
  ]);

  const groups: { title: string; note: string; areas: Area[] }[] = [
    {
      title: "Catalogue",
      note: "Products, categories and collections — add, edit, delete from each page.",
      areas: [
        { title: "Products", description: "Photos, price, stock, sizes, colours", href: "/admin/products", addHref: "/admin/products/new", count: products.total, unit: "pieces" },
        { title: "Categories", description: "Sarees, dresses, tops…", href: "/admin/categories", count: categories.length },
        { title: "Collections", description: "Seasonal edits and capsules", href: "/admin/collections", count: collections.length },
        { title: "Inventory", description: "Stock levels and adjustments", href: "/admin/inventory", count: orders, unit: "orders" },
      ],
    },
    {
      title: "Homepage & content",
      note: "Every section of the storefront, in the order customers see it.",
      areas: [
        { title: "Hero sliders", description: "Homepage banners with image, copy and link", href: "/admin/banners", count: banners.filter((b) => b.placement === "home_hero").length, unit: "slides" },
        { title: "Homepage sections", description: "Show, hide and reorder each block", href: "/admin/homepage", count: sections.filter((s) => s.visible).length, unit: "visible" },
        { title: "Pages", description: "About, policies, editorial pages", href: "/admin/pages", count: pages.length },
        { title: "FAQ", description: "Questions customers actually ask", href: "/admin/pages", count: faqs.length, unit: "entries" },
        { title: "Navigation", description: "Header and footer menus", href: "/admin/navigation", count: "—" },
        { title: "Media library", description: "Every uploaded image (Cloudinary)", href: "/admin/media", count: media.length, unit: "shown" },
      ],
    },
    {
      title: "Sales & marketing",
      note: "Money in, and the offers that bring it.",
      areas: [
        { title: "Orders", description: "Status, payment, notes, emails", href: "/admin/orders", count: orders },
        { title: "Discounts", description: "Coupon codes shown on the home page", href: "/admin/coupons", count: coupons.length, unit: "codes" },
        { title: "Payment methods", description: "bKash, Nagad, card, cash — add any", href: "/admin/settings/payments", count: methods.length, unit: "methods" },
        { title: "Reviews", description: "Approve or delete customer reviews", href: "/admin/reviews", count: reviews.length },
        { title: "Customers", description: "Accounts, orders, contact details", href: "/admin/customers", count: customers },
        { title: "Subscribers", description: "Newsletter sign-ups", href: "/admin/reports", count: subscribers },
      ],
    },
    {
      title: "Brand & access",
      note: "The name on the door, and who can walk in.",
      areas: [
        { title: "Brand & contact", description: "Site name, tagline, phone, address", href: "/admin/settings/general", count: "Edit" },
        { title: "Logo & colours", description: "Logo, favicon, accent colour", href: "/admin/settings/appearance", count: "Edit" },
        { title: "Shipping", description: "Charges per district, free-shipping threshold", href: "/admin/settings/shipping", count: "Edit" },
        { title: "Staff & roles", description: "Add or remove admin accounts", href: "/admin/users", count: staffCount, unit: "people" },
      ],
    },
  ];

  const services = integrationSummary();

  return (
    <div className="space-y-5">
      <AdminPageTitle
        title="Everything on the site"
        description="One page with every part of the shop — what it holds today, and where to add, edit or delete it."
        action={
          <Link href="/" target="_blank" className="rounded-full border border-line px-5 py-2.5 text-[10px] uppercase tracking-label text-ink hover:bg-cream-200/60">
            Open the shop ↗
          </Link>
        }
      />

      <Panel className="p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg">Connected services</h2>
            <p className="text-[11px] text-ink-muted">
              {services.on} of {services.total} switched on. Anything off still works in a reduced
              mode — paste the key in <code className="rounded bg-cream-200/70 px-1 py-0.5">.env.local</code>{" "}
              (or in Vercel) and it turns itself on.
            </p>
          </div>
          <span className="rounded-full bg-cream-200/70 px-3 py-1 text-[10px] uppercase tracking-label text-ink-soft">
            npm run check:env
          </span>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {services.list.map((service) => (
            <li key={service.key} className="flex items-start gap-2.5 rounded-lg border border-line/70 bg-white/50 p-3">
              <span
                className={
                  "mt-1 size-2 shrink-0 rounded-full " +
                  (service.state === "on" ? "bg-emerald-600" : service.state === "manual" ? "bg-amber-500" : "bg-ink/25")
                }
              />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-ink">{service.name}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-muted">{service.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {groups.map((group) => (
        <section key={group.title}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-lg">{group.title}</h2>
            <p className="hidden text-[10.5px] text-ink-muted sm:block">{group.note}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.areas.map((area) => (
              <Link
                key={area.title}
                href={area.href}
                className="card-surface group flex flex-col justify-between gap-3 p-4 transition hover:border-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-[15px] text-ink">{area.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">{area.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-cream-200/70 px-2.5 py-1 text-[10px] uppercase tracking-wide2 text-ink-soft">
                    {area.count}
                    {area.unit ? ` ${area.unit}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-label text-gold-dark opacity-0 transition group-hover:opacity-100">
                    Manage →
                  </span>
                  {area.addHref ? (
                    <Link
                      href={area.addHref}
                      className="rounded-full border border-line px-2.5 py-1 text-[9.5px] uppercase tracking-wide2 text-ink-soft transition hover:border-gold hover:text-ink"
                    >
                      + Add
                    </Link>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <Panel className="p-4 text-[11.5px] leading-relaxed text-ink-muted">
        Every list in the panel has <strong className="text-ink">Add</strong> and{" "}
        <strong className="text-ink">Delete</strong> on the page itself, and every save takes effect on the
        storefront immediately. If you ever want something on the site that is not listed here, that is the
        only case where I need to build it.
      </Panel>
    </div>
  );
}
