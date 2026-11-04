# Verification log

What has actually been run against this codebase, and what has not. Updated as work lands.

Environment used: 2 vCPU / 1.98 GB RAM container, MongoDB 7.0.14 single-node replica set
(`rs0`) on `127.0.0.1:27017`, Next.js 15.5.28.

## Passing

### 1. Type safety — `npm run typecheck`

`tsc --noEmit` exits 0 over the whole project (app, components, lib, scripts), including the
admin panel, middleware and the smoke test.

### 2. Data layer — `npm run smoke`

A headless runner (`scripts/smoke.ts`) calls the same service functions the pages and the
panel use, against the real database. **40 checks, 0 failures**, covering:

- settings + navigation load, homepage sections ordered, FAQs, footer pages
- categories/collections listing and lookup by slug
- product listing shape (`total`, `totalPages`, `priceBounds`), detail by slug, variant
  data, filtered + sorted listing, size/colour facets, related products, text search,
  price-range filter
- coupons listed and evaluated against a subtotal
- order creation end to end (unique order number, totals, tracking by order number + phone,
  tracking rejected for a wrong phone), admin pagination, admin search
- status ladder: pending → confirmed ok, illegal jump to delivered rejected,
  confirmed → processing ok, payment marked paid
- dashboard stats, 30-day revenue series (zero-filled), top products, sales report for a
  date range, customer list
- newsletter subscribe + idempotent duplicate handling
- cleanup: the throwaway order, subscriber and inventory rows are removed afterwards

It is safe to run repeatedly against a development database.

### 2b. Performance — `npm run bench`

Storefront cache, measured on the development machine:

| read | cold | warm |
| --- | --- | --- |
| getSiteSettings | 2.4 ms | 0.01 ms |
| getCategories | 2.3 ms | 0.01 ms |
| getCollections | 1.6 ms | 0.01 ms |
| getHomepageSections | 1.8 ms | 0.01 ms |
| getFooterPages | 1.8 ms | 0.01 ms |
| getFaqs | 1.5 ms | 0.01 ms |
| getHomepageProducts | 7.0 ms | 0.05 ms |
| listProducts (shop page 1) | 4.3 ms | 0.01 ms |
| **total** | **22.7 ms** | **0.12 ms** |

Homepage served by `next dev`: first render 3.60 s (compile + cold reads), second
request **0.24 s**. Admin mutations clear the cache through `audit()`, so edits are not
served stale.

### 2c. Access rules (accounts required for bag, checkout, account pages)

`npm run check:routes` — 27/27 cases pass (public pages allowed; `/cart`, `/checkout`,
`/wishlist`, `/order-success`, `/account/**` redirect to `/login?next=…`; `/admin/**` to
`/admin/login`; signed-in visitors bounce off `/login`).

Checked against the running dev server:

| Request | Result |
| --- | --- |
| `GET /account` (guest) | 307 → `/login?next=%2Faccount` |
| `GET /account/orders` (guest) | 307 → `/login?next=%2Faccount%2Forders` |
| `GET /account/addresses` (guest) | 307 → `/login?next=%2Faccount%2Faddresses` |
| `GET /cart`, `/checkout`, `/wishlist`, `/order-success` (guest) | 307 → `/login?next=…` |
| `POST /api/checkout` (guest) | 401 `requiresAuth: true`, `loginUrl: /login?next=%2Fcheckout` |
| `POST /api/reviews` (guest) | 401 `requiresAuth: true` |
| `GET /account` (customer) | 200 — dashboard with orders and spend |
| `GET /account/addresses` (customer) | 200 — address book (empty state + "Add address") |
| `GET /account/reviews` (customer) | 200 — own reviews with approval status |
| `GET /cart` (customer) | 200 |
| `GET /checkout` (customer) | 200 — COD / bKash / Nagad / card, saved address prefilled |
| `GET /admin/dashboard` (staff) | 200 — studio unaffected |
| `GET /shop`, `/login` (guest) | 200 |

Address book service exercised end-to-end: first address becomes default, "make default"
moves it, editing keeps the id, deleting the default promotes the next one, and the rows
are removed afterwards (test data cleaned up).

### 2d. Mobile refinement

* Phone-first tweaks live in one clearly marked block at the end of `app/globals.css`:
  no sideways scrolling (`overflow-x: clip`), 16px form controls on small screens (stops
  iOS zooming the page on focus), 44px minimum tap targets, safe-area aware sticky bars,
  native-feeling horizontal rails, balanced headings and film-free tap highlights.
* Hero: height uses `svh` so mobile browser chrome does not crop the slide; type steps
  down to 32px/23px on phones and the copy keeps clear of the slide dots.
* Product page: a phone-only sticky buy bar (price, size/colour, add-to-bag) appears
  within thumb reach; the page reserves space for it so nothing is covered.
* Gallery thumbnails scroll in a snap rail; shop filters already open in a slide-over
  dialog; cart drawer is full width up to `max-w-md`; toasts sit above the buy bar.
* Account area stacks into one column with a horizontally scrollable tab strip; order
  rows wrap instead of overflowing; admin keeps its hamburger drawer and scrollable tables.

Checked on the running server: `/` (200, hero `svh` + tap targets present), `/shop` (200),
`/products/roshni-blush-silk-slip-dress` (200, both sign-in CTAs and the sticky bar in the
markup), `/login` + `/register` now carry `?next=` in both directions.

### 2e. Payments, email, SEO

* `npm run seed` after a clean database seeds the catalogue **and** the payment methods
  (verified: `listPaymentMethods()` returns `cod, bkash, nagad, sslcommerz` — the first read
  imports the defaults, so a fresh shop is never unable to take money).
* Labels resolve from the database (`getPaymentLabel("bkash") → "bKash"`), with the stored
  key as the fallback for methods that were later deleted.
* `/api/checkout` rejects an unknown or disabled method (400) and a manual wallet without a
  transaction id (422); gateway methods return `redirectUrl` instead of an order page.
* bKash: `isBkashConfigured()` is false without keys (expected here) — the manual bKash flow
  keeps working meanwhile. The callback never trusts the query string: it executes the
  payment, checks `transactionStatus === "Completed"` and compares the amount.
* Email: `mailerSummary()` reports `configured: false` without a Resend key, and checkout
  continues. Templates are plain HTML tables (no images, no external CSS).
* SEO: `GET /robots.txt` → 200 with `/admin`, `/account`, `/cart`, `/checkout` disallowed;
  `GET /sitemap.xml` → 200, 44 URLs generated from the catalogue.
* tsc clean, smoke 40/40, check:routes 27/27.

Not verified in this sandbox (needs real keys or more memory than 2 GB): a live bKash
sandbox payment, a real Resend delivery, and rendering the admin payments page in the
browser — it compiles cleanly but the dev server is killed by the OOM on that route here.

### 2f. Cloudinary image hosting (live credentials)

Configured with the project's own Cloudinary environment (`hwynbmrx`).

| Check | Result |
| --- | --- |
| `npm run check:cloudinary` | uploads a 1×1 PNG, prints the `res.cloudinary.com/...` URL, deletes it → `upload ok: true` |
| `POST /api/admin/upload` (admin session, real PNG) | 200 → `https://res.cloudinary.com/hwynbmrx/image/upload/.../labonno/products/….png` + media record |
| `DELETE /api/admin/media?id=…` | 200 → `{ ok: true, message: "Image deleted." }` — file removed from Cloudinary **and** the library |
| Unauthenticated upload | still blocked by `requireApiAdmin()` |

Both credential styles work: the three variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`) or Cloudinary's single `CLOUDINARY_URL`. Uploads land in
`labonno/<folder>` with `f_auto`/`q_auto` delivery, and `next/image` is allowed to optimise
`res.cloudinary.com` (see `next.config`).

### 3. Clean-install quickstart — the exact path in `docs/HANDOVER.md`

Run from a fresh clone with an empty `node_modules` and an empty data directory:

| Step | Result |
| ---- | ------ |
| `npm install` | 500 packages, no errors |
| `npm run db:mongo` | started mongod, initiated replica set `rs0`, printed connection info |
| `npm run seed` | catalogue, CMS content, 3 accounts and 8 demo orders inserted |
| `npm run smoke` | **40 passed, 0 failed** |
| `npm run typecheck` | clean |

### 4. HTTP behaviour — dev server

Exercised with `curl` against `next dev`:

| Request | Result |
| ------- | ------ |
| `GET /` | 200, full section-driven homepage rendered from the database |
| `GET /admin`, `GET /admin/dashboard` (no cookie) | 307 → `/admin/login` (middleware) |
| `POST /api/auth/sign-in/email` (admin) | 200, `role: super_admin`, session cookie issued |
| `GET /api/auth/get-session` | 200, session and user with role |
| `POST /api/newsletter` invalid email | 422 `{ error: "Enter a valid email address" }` |
| `POST /api/newsletter` valid | 200 `{ ok: true, message }` |
| `GET /api/wishlist` signed out | 200 `{ productIds: [] }` (header badge safe) |
| `POST /api/wishlist` signed out | 401 `{ error, requiresAuth: true }` |

## Not yet verified in this environment

The container has ~800 MB of free RAM once the platform and mongod are resident;
`next build` needs roughly 1.2–1.5 GB and the compile worker is killed (SIGKILL) on webpack,
with `--turbopack`, with a 768 MB / 900 MB / 1024 MB heap cap, and with the DB stopped.
`next dev` behaves the same way after the first route: Next's own memory watchdog restarts
the server while compiling a second route, so only the first compiled route could be
browser-tested here.

Therefore, **not verified yet** (needs a machine with ≥ 4 GB RAM):

- `npm run build` / `npm start` (production build, static analysis of every route)
- Browser walkthrough of the admin panel: product create/edit, order status transitions in
  the UI, payment verification, media upload, reports date filter, role change as super admin
- Cloudinary upload path (no credentials configured; the local-fallback path is wired and the
  UI reports which mode is active)
- SSLCommerz round trip (sandbox store credentials not supplied). The handler's validation
  logic — `val_id` lookup, amount match, idempotent IPN — is implemented and type-checked but
  has not been exercised against the live sandbox

Nothing above is claimed to work. Run `npm run build && npm run start` on a larger machine,
then walk the admin checklist before launch.
