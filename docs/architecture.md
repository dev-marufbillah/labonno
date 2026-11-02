# Architecture

## 1. Data model (MongoDB collections)

| Collection | Purpose | Key fields |
| ---------- | ------- | ---------- |
| `products` | Catalogue | `slug`, `sku`, `name`, `price`, `salePrice`, `category`, `collections[]`, `variants[]` (`size`, `color`, `sku`, `stock`), `images[]`, `featured`, `bestSeller`, `newArrival`, `status` |
| `categories` | Top-level nav categories | `slug`, `name`, `description`, `image`, `order`, `visible` |
| `collections` | Curated edits | `slug`, `name`, `tagline`, `image`, `order`, `visible` |
| `orders` | Orders | `orderNumber`, `userId`, `customer`, `shippingAddress`, `items[]`, `subtotal`, `discount`, `deliveryCharge`, `total`, `coupon`, `paymentMethod`, `paymentStatus`, `paymentRef`, `status`, `statusHistory[]`, `inventoryApplied` |
| `inventory_logs` | Stock audit trail | `productId`, `variantSku`, `delta`, `reason`, `actor`, `createdAt` |
| `coupons` | Discounts | `code`, `type` (`percentage`/`fixed`), `value`, `minSubtotal`, `usageLimit`, `usedCount`, `startsAt`, `expiresAt`, `active` |
| `reviews` | Product reviews | `productId`, `userId`, `name`, `rating`, `title`, `body`, `status` (`pending`/`approved`/`rejected`) |
| `wishlists` | One doc per customer | `userId`, `productIds[]` |
| `content_pages` | CMS pages + policies | `slug`, `title`, `sections[]`, `published`, `showInFooter`, `reserved` |
| `homepage_sections` | Homepage builder | `key`, `type`, `title`, `subtitle`, `config`, `order`, `visible` |
| `banners` | Hero + promo banners | `placement`, `title`, `image`, `href`, `order`, `active` |
| `faqs` | FAQ entries | `question`, `answer`, `category`, `order`, `visible` |
| `site_settings` | Single doc `_id: "site"` | `general`, `navigation`, `newsletter`, `payments`, `shipping`, `seo`, `appearance` |
| `media` | Media library | `url`, `publicId`, `format`, `bytes`, `folder`, `createdAt` |
| `subscribers` | Newsletter | `email` (unique), `source`, `createdAt` |
| `contact_messages` | Contact form inbox | `name`, `email`, `phone`, `subject`, `message`, `handled` |
| `user`, `session`, `account`, `verification` | Better Auth | managed by the adapter; `user.role` is `customer` / `admin` / `super_admin` |

Indexes for all of the above are created by `ensureIndexes()` in `lib/db/mongo.ts` and by
the seed script.

## 2. Layer boundaries

```
app/**/page.tsx ─┬─> lib/services/*        (server-only data access)
                 ├─> lib/actions/*         (server actions: validate → authorise → service → revalidate)
                 └─> components/*          (presentational; client components only for interaction)

app/api/**/route.ts ──> lib/services/*     (JSON endpoints, guarded with lib/auth/guards.ts)
```

Rules the codebase follows:

- **Services own MongoDB.** No page, component or route handler opens a collection directly.
- **Server actions re-authorise.** `lib/actions/helpers.ts` resolves the session on every call
  and throws when the role is insufficient — the client is never trusted.
- **Trim before you ship.** `toCardData()` in `lib/utils/product-card.ts` produces the small
  shape listing pages and client components receive. It is server-safe on purpose: importing
  a client-module helper into a server component breaks the RSC boundary.
- **One listing shape.** `listProducts()` returns
  `{ products, total, page, perPage, totalPages, priceBounds }`, and filters/sort/pagination
  travel as URL search params (`q, size, color, min, max, sort, page`) so every listing page
  is shareable, cacheable and back-button friendly.

## 3. Homepage: fully section-driven

`app/(site)/page.tsx` loads visible rows from `homepage_sections` ordered by `order` and maps
each `type` through `renderSection()`:

`hero` · `category_arches` · `featured_collection` · `product_grid` · `editorial` · `newsletter`

Admin keys written by the builder are the same ones the renderer expects
(`hero`, `categories`, `featured-collection`, `best-sellers`, `editorial`, `newsletter`), so
staff can add, reorder, hide or retitle sections without a deploy. Nothing on the homepage is
hardcoded except the fallback when a section is hidden.

Header/footer links come from `site_settings.navigation.header` / `.footer` / `.social`;
brand copy, newsletter text, shipping rates and SEO defaults come from the same document.

## 4. Auth and roles

- Better Auth with the MongoDB adapter; cookie prefix `labonno`, 30-day sessions, 5-minute
  cookie cache, rate limit 8 sign-ins/min per IP.
- `middleware.ts` is a cheap edge gate: it only checks that a session cookie exists and
  redirects anonymous visitors away from `/admin/*` and `/account/*`, or signed-in visitors
  away from `/login` and `/register`. It never decodes the cookie.
- The authoritative check is server-side: `requireAdmin()` / `requireSuperAdmin()` in
  `lib/auth/server.ts` for pages, `requireApiAdmin()` / `requireApiUser()` in
  `lib/auth/guards.ts` for route handlers.
- `super_admin` is the only role that can change another user's role, and nobody can change
  their own. `admin` can run the shop but cannot manage admin accounts.

## 5. Order lifecycle

```
pending ──> confirmed ──> processing ──> shipped ──> delivered
   │            │             │            │
   └────────────┴─────────────┘            └──────> returned
        cancelled (any stage before shipping)
```

`updateOrderStatus()` enforces this ladder — illegal jumps are rejected, not silently
applied — and appends to `statusHistory`. Customers may cancel only from `pending` or
`confirmed` (`cancelOrderByCustomer`). Stock is decremented once, on order creation, and
restored if the order is cancelled before dispatch (`inventoryApplied` guards double-apply).

## 6. Payments

| Method | Flow |
| ------ | ---- |
| Cash on delivery | Order is created `pending` / `paymentStatus: unpaid`; staff collect on delivery |
| bKash / Nagad | Customer sends money to the merchant number shown at checkout and submits the transaction ID; order is created with `paymentStatus: "pending_verification"` and staff verify it in **Orders → payment panel** |
| SSLCommerz | Order is created, then the customer is redirected to the gateway. `POST /api/payments/sslcommerz/{success,fail,cancel,ipn}` reads `val_id` and calls the SSLCommerz validation API. The amount returned by the gateway must match the order total before `paymentStatus` becomes `paid` — a browser redirect on its own is never trusted. IPN returns JSON for the gateway and is idempotent. |

Unconfigured methods are hidden at checkout, so there is no dead payment button.

## 7. Rendering and performance

- All data routes are dynamic (see README) — the panel is the source of truth.
- Listing pages paginate server-side (default 12/page) and compute price bounds once per query.
- Images use `next/image` with Cloudinary/Unsplash remote patterns, AVIF/WebP output.
- Security headers (`nosniff`, `SAMEORIGIN`, referrer policy, restrictive `Permissions-Policy`)
  are set globally in `next.config.ts`; `poweredByHeader` is off.
