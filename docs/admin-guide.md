# LABONNO admin guide

Sign in at `/admin/login` with your studio account. The panel is split into four groups in
the left rail: the shop, content, reports, and settings. Everything you save is live on the
storefront immediately — there is no publish step and no cache to clear.

Roles: **super admin** can do everything, including managing admin accounts.
**Admin** can run the shop and content but cannot change anyone's role.

---

## Daily work

### Orders — `/admin/orders`
- Filter by status or payment state, or search by order number, customer name, phone or email.
- Open an order to see items, totals, delivery address, the full status history and notes.
- **Status** follows a fixed ladder: pending → confirmed → processing → shipped → delivered,
  with cancelled / returned as the exit paths. The panel only offers legal next steps, so a
  shipped order can never jump back to pending.
- **Payment panel**: mark a payment paid, pending verification or failed. bKash and Nagad
  transfers arrive as *pending verification* with the customer's transaction ID — check the
  transfer in your bKash/Nagad app, then mark it paid. Verified SSLCommerz payments are
  marked paid automatically by the gateway callback.
- Notes are internal and never shown to the customer.

### Products — `/admin/products`
- Create or edit: name, slug, SKU, category, collections, description, fabric/care details,
  price and sale price, images, and a variant grid of size × colour with per-variant stock.
- Flags (featured, best seller, new arrival) control which homepage/product rails pick the
  piece up. Status `draft` keeps it off the storefront.
- Deleting is permanent and asks for confirmation.

### Inventory — `/admin/inventory`
- Live stock per variant with low-stock highlighting.
- Use the adjust action to add or correct stock: every change is written to
  `inventory_logs` with the reason and the staff member, so discrepancies are traceable.
- Stock is taken out of the shelf when an order is placed, and returned if the order is
  cancelled before dispatch.

### Categories & collections
- Categories appear in the header nav and `/categories` arches; collections are the curated
  edits under `/collections`. Both have slug, copy, image, order and a visibility switch.

### Customers — `/admin/customers`
- Customer list with order counts and lifetime value; open a customer to see their orders
  and contact details. Read-only by design — you edit accounts under Settings → Admin users.

### Discounts — `/admin/coupons`
- Percentage or fixed-amount codes, optional minimum subtotal, usage limits and start/expiry
  dates. Validation happens server-side again at checkout, so a stale code cannot be forced.

### Reviews — `/admin/reviews`
- New reviews land as *pending*. Approve to publish them on the product page, reject to keep
  them off, or delete outright.

---

## Content

### Homepage — `/admin/homepage`
The storefront homepage is a stack of sections. Each row can be edited (title, subtitle,
linked collection, product source), hidden without deleting, or moved up/down; the order in
this screen is the order on the page. Available types: hero, category arches, featured
collection, product grid, editorial and newsletter. Changes appear on the next page load.

### Banners — `/admin/banners`
Hero and promotional images with a link target, order and active switch.

### Pages — `/admin/pages`
- Content pages (About, Size guide, Terms, policies…) with a title, slug and section content.
- Reserved slugs are served from the built-in route (`/privacy-policy`, `/terms`,
  `/shipping-policy`, `/return-policy`, `/faq`, `/about`, `/contact`, `/size-guide`) so the
  header/footer links keep working; everything else is served at `/p/<slug>`.
- FAQ entries are managed on the same screen (question, answer, category, order).
- Pages can be flagged for the footer (`showInFooter`) — that is what builds the footer link
  list, together with the navigation settings below.

### Navigation — `/admin/navigation`
- Header menu, footer columns and social links. Dropdown items are entered one per line as
  `Label|/url`; plain lines become top-level links.
- These lists are the single source of truth — no link is hardcoded in the theme.

### Media library — `/admin/media`
- Upload images and copy their URLs into products, banners or pages.
- If Cloudinary is not configured the uploader writes to `/public/uploads` and says so at the
  top of the screen; configure `CLOUDINARY_*` in the environment to switch to the CDN.

---

## Reports — `/admin/reports`
Pick a date range (defaults to the last 30 days) to see revenue, order count, average order
value, top products, revenue split by payment method and the orders placed in that window.
The dashboard additionally shows the 30-day revenue trend (quiet days are plotted as zero),
low-stock alerts and recent orders.

---

## Settings

| Screen | What it controls |
| ------ | ---------------- |
| General | Brand name, tagline, contact details, address, currency, social handles |
| Appearance | Announcement bar, accent colour and other presentation switches |
| Payments | Which methods are offered at checkout, bKash/Nagad merchant numbers, SSLCommerz on/off. A method switched off here disappears from checkout entirely |
| Shipping | Delivery charges inside/outside Dhaka, per-district zones, free-shipping threshold, delivery estimate, return window |
| Admin users | Promote or demote staff (`customer` / `admin` / `super_admin`). Super admins only, and never their own account |

Your own name, phone and password live under **Profile**.

---

## Things to do before launch

1. Change all seed passwords (admin, manager, customer).
2. Fill Settings → General, Shipping and Payments with real studio details and rates.
3. Replace demo products, images and banners with the real collection.
4. Review the CMS pages (policies, size guide, About) — they are real, editable copy, not
   placeholders, but they must reflect your studio's actual terms.
5. Configure SSLCommerz (or switch card payments off) and set the IPN URL to
   `https://<your-domain>/api/payments/sslcommerz/ipn`.
