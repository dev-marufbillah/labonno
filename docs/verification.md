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

### 3. HTTP behaviour — dev server

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
