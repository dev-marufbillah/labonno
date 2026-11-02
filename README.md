# LABONNO

Luxury Bangladeshi womenswear storefront and back office, built as a single Next.js 15
application with MongoDB, Better Auth and a fully CMS-driven front end.

```
Customer storefront  (29 routes)      Admin panel  (26 routes)
────────────────────────────────      ─────────────────────────
Homepage (section builder)            Dashboard / Orders / Products / Inventory
Shop, search, category, collection    Categories / Collections / Customers
Product detail + reviews              Discounts / Reviews / Reports
Cart, checkout, payment               Homepage builder / Banners / Pages
Order tracking, account, wishlist     Navigation / Media library
CMS pages, policies, FAQ, contact     Settings (general, appearance, payments, shipping)
                                      Admin users, Profile
```

---

## Stack

| Layer      | Choice |
| ---------- | ------ |
| Framework  | Next.js 15 (App Router, React 19, Server Actions) |
| Language   | TypeScript, strict |
| Database   | MongoDB 7 (Atlas in production, local replica set in development) |
| Auth       | Better Auth — email/password + optional Google, role-aware sessions |
| Styling    | Tailwind CSS, self-hosted Cormorant Garamond + Jost |
| Forms      | React Hook Form + Zod |
| Charts     | Recharts (admin only) |
| Media      | Cloudinary when configured, local `/public/uploads` fallback |
| Payments   | Cash on delivery, bKash / Nagad manual transfer, SSLCommerz hosted checkout |

---

## Quick start

```bash
npm install
cp .env.example .env.local        # then fill in the values below
npm run db:mongo                  # local replica set on 127.0.0.1:27017 (rs0)
npm run seed                      # categories, collections, 16 products, CMS content, demo orders
npm run dev                       # http://localhost:3000  ·  /admin for the panel
```

### Seed accounts

| Role          | Email                  | Password       |
| ------------- | ---------------------- | -------------- |
| `super_admin` | admin@labonno.com      | `Labonno@2026` |
| `admin`       | manager@labonno.com    | `Labonno@2026` |
| `customer`    | customer@labonno.com   | `Labonno@2026` |

Change these before going live: set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`,
`SEED_STAFF_*` and `SEED_CUSTOMER_*` in the environment before running `npm run seed`.

---

## Environment variables

Copy `.env.example` → `.env.local`. Everything is read server-side only; no secret is ever
exposed to the browser bundle.

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL, used for redirects, sitemap, trusted origins |
| `MONGODB_URI` / `MONGODB_DB` | yes | Database connection |
| `BETTER_AUTH_SECRET` | yes | Session signing key — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | yes | Auth base URL (same origin as the site) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` / `_UPLOAD_FOLDER` | no | Media library uploads. Unset → files are written to `public/uploads` and the admin UI says so |
| `GOOGLE_CLIENT_ID` / `_SECRET` | no | Google sign-in. Unset → the button is hidden |
| `SSLCOMMERZ_STORE_ID` / `_STORE_PASSWORD` / `SSLCOMMERZ_SANDBOX` | for cards/SSLCommerz | Hosted checkout + server-side `val_id` validation |
| `BKASH_*`, `NAGAD_*` | no | Reserved for gateway APIs. Today bKash/Nagad are manual transfers verified by staff |
| `SEED_*` | no | Seed credentials |

Payments that are not configured are simply not offered at checkout: the method list comes
from **Admin → Settings → Payments**, so the storefront never shows a button that cannot work.

---

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `next lint` |
| `npm run seed` | Idempotent seed: drops and reloads catalogue + CMS demo data |
| `npm run smoke` | Headless data-layer test (40 checks) against the live database — see `docs/verification.md` |
| `npm run db:mongo` | Starts a local single-node replica set with a small WiredTiger cache |

---

## Project layout

```
app/
  (site)/          storefront routes — shared header/footer layout, all CMS-driven
  admin/           login screen + (panel) group guarded by role
  api/             route handlers: auth, checkout, coupons, newsletter, wishlist,
                   reviews, contact, orders/[id]/cancel, payments/sslcommerz/[action],
                   admin/upload, products
components/
  site/            storefront UI (header, footer, sections, product cards, forms)
  admin/           admin shell, tables, dialogs, editors
  ui/              shared primitives
lib/
  db/              Mongo client, index bootstrap, collection types
  services/        the only place that touches MongoDB (catalog, products, orders,
                   pricing, coupons, reports, customers, content, settings, media, wishlist)
  actions/         server actions ("use server") used by admin forms
  payments/        SSLCommerz API client + validation
  auth/            Better Auth core, session helpers, API guards
  config/          site + admin navigation config, design tokens
  utils/           formatting, slugs, product card projection
middleware.ts      edge gate for /admin and /account (cookie presence only)
scripts/           seed, local mongo launcher, smoke test
docs/              architecture, admin guide, verification notes
```

### Rendering strategy

Storefront and admin routes are `force-dynamic`: every screen reads live catalogue,
inventory, settings and CMS content, and an admin edit must be visible on the next request.
Static prerendering would bake stale prices into HTML — unacceptable for a shop that runs
flash edits from the panel. `sitemap.xml` is dynamic for the same reason.

### Data access rules

- Pages never query MongoDB directly; they call `lib/services/*`.
- Product cards are trimmed server-side with `toCardData()` so client components never
  receive full product documents.
- Every mutation goes through a server action or route handler that re-checks the session
  and role on the server. Client-supplied roles are ignored.

---

## Deploying

1. Provision MongoDB Atlas (replica set is required — the driver uses transactions for
   order creation) and a Cloudinary account.
2. Set every variable from `.env.example` in your host (Vercel recommended).
3. `npm run seed` once against the production database, then rotate the seed passwords.
4. `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` must be the real domain — auth cookies,
   SSLCommerz redirects and the sitemap all depend on them.
5. Point the SSLCommerz IPN URL at `https://<domain>/api/payments/sslcommerz/ipn`, and the
   success/fail/cancel URLs at `…/success`, `…/fail`, `…/cancel`.
6. Build on a machine with **at least 4 GB RAM** (`next build` peaks around 1.2–1.5 GB;
   it is killed on 2 GB containers), or let the platform build it.

---

## Documentation

- `docs/architecture.md` — data model, service layer, order lifecycle, auth & roles, payments
- `docs/admin-guide.md` — task-by-task guide for studio staff
- `docs/verification.md` — what has been tested, how, and what needs a bigger machine
