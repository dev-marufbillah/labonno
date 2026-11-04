# LABONNO — Handover & Launch Plan

**তারিখ:** 3 November 2026
**রিপো:** `labonno` (ব্রাঞ্চ `master`, ৩টি commit, সম্পূর্ণ history সহ)

---

## ০. সংক্ষেপে (TL;DR — বাংলা)

| প্রশ্ন | উত্তর |
| --- | --- |
| কোড কীভাবে নেব? | `LABONNO-kit-2026-11-03.zip` ফাইলটি ডাউনলোড করে extract করুন — ভেতরে পুরো প্রজেক্ট + `.git` (history) আছে। অথবা `LABONNO-2026-11-03.bundle` ফাইলটি `git clone` করে নিন। |
| VS Code-এ চালাতে কী লাগবে? | Node.js 20+, MongoDB (Atlas free cluster সবচেয়ে সহজ), `.env.local` ফাইল, তারপর `npm install` → `npm run seed` → `npm run dev`. নিচে ধাপে ধাপে দেওয়া আছে (§2)। |
| এখন কী বাকি? | কোড কাজ প্রায় শেষ; বাকি কাজ দুই ভাগে (§3): **আমি করব** (build verify, email notification, e2e test, SSLCommerz test, SEO) আর **আপনি করবেন** (account/credential, ডোমেইন, ছবি, deploy, UAT)। |
| লাইভ করতে কত সময়? | আপনার কাছ থেকে credential + ছবি পেলে কোডের দিক থেকে ১–২ দিন; deploy + gateway approval আপনার দিক থেকে সময়সাপেক্ষ (bKash/Nagad merchant KYC)। |

---

## 1. Kit-এ কী আছে

```
LABONNO-kit-2026-11-03.zip
├── app/            storefront (29 routes) + admin panel (26 routes) + API routes
├── components/     site/ admin/ ui/ components
├── lib/            db, services, actions, auth, payments, config, utils
├── scripts/        seed.ts, start-mongo.sh, smoke.ts
├── public/         brand images & self-hosted fonts
├── docs/           architecture.md, admin-guide.md, verification.md, HANDOVER.md (এই ফাইল)
├── middleware.ts
├── README.md
├── .env.example    সব environment variable-এর list (secret নেই)
└── .git/           পুরো commit history (git log দেখতে পাবেন)
```

**ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে:** `node_modules/` (আপনি `npm install` করবেন), `.next/` (build output), `.env.local` (**কোনো secret kit-এ নেই** — নিরাপত্তার জন্য), local MongoDB data।

### দুইভাবে নেওয়ার উপায়

**A. Zip (সহজ)**
1. `LABONNO-kit-2026-11-03.zip` ডাউনলোড করুন।
2. Extract করুন (Windows: right-click → Extract All; macOS: double-click)।
3. VS Code → **File ▸ Open Folder** → `labonno` ফোল্ডার।
4. Terminal খুলুন (`` Ctrl+` ``) → `git log --oneline` দিলে ৩টি commit দেখবেন — অর্থাৎ history অক্ষত।

**B. Git bundle (পুরো repo একটাই ফাইল)**
```bash
git clone LABONNO-2026-11-03.bundle labonno
cd labonno
```
Bundle-এ সব branch ও commit আছে; `git clone` করলে ঠিক live repo-র মতোই হয়ে যাবে।

**GitHub-এ রাখতে চাইলে** (recommended — backup + team access):
```bash
cd labonno
git remote add origin https://github.com/<your-username>/labonno.git
git branch -M main
git push -u origin main
```
> `.gitignore`-এ `.env.local`, `node_modules`, `.next`, `.mongo-data`, `public/uploads/*` আছে — ভুলেও secret commit হবে না। তবু GitHub-এ **private repo** রাখুন।

---

## 2. VS Code-এ চালানো (ধাপে ধাপে)

### ধাপ ১ — যা যা ইনস্টল লাগবে
| সফটওয়্যার | ভার্সন | লিংক |
| --- | --- | --- |
| Node.js LTS | **20 বা তার উপরে** | https://nodejs.org |
| VS Code | latest | https://code.visualstudio.com |
| MongoDB | 7.x **অথবা** Atlas (free) | নিচে §2.2 |
| Git (optional) | latest | https://git-scm.com |

VS Code-এ recommended extension: **ESLint**, **Tailwind CSS IntelliSense**, **Prettier**।
Terminal-এ চেক করুন:
```bash
node -v     # v20.x বা v22.x
npm -v
```

### ধাপ ২ — `.env.local` তৈরি করুন
Project ফোল্ডারে (অর্থাৎ `package.json` যেখানে আছে) একটি ফাইল বানান `.env.local` — `.env.example` কপি করাই সহজ:

```bash
npm run setup      # .env.local বানাবে + একটা নতুন BETTER_AUTH_SECRET বসাবে
# অথবা নিজে: cp .env.example .env.local  (Windows: Copy-Item)
```

তারপর এই তিনটি লাইন নিজের মান বসিয়ে ঠিক করুন:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# এই secret নিজে বানান (নিচের কমান্ডের output বসান):
BETTER_AUTH_SECRET=...
```
`BETTER_AUTH_SECRET` বানানোর কমান্ড:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`MONGODB_URI` ঠিক করুন ধাপ ৩ অনুযায়ী। বাকি (`CLOUDINARY_*`, `GOOGLE_*`, `SSLCOMMERZ_*`) খালি রাখলেও অ্যাপ চলবে — শুধু ওই ফিচারগুলো বন্ধ থাকবে।

### ধাপ ৩ — Database (দুটির যেকোনো একটি)

**অপশন A — MongoDB Atlas (সবচেয়ে সহজ, Windows-এ recommended)**
1. https://cloud.mongodb.com → free sign up → **Create** → **M0 Free** cluster।
2. **Database Access** → নতুন user বানান (username + password মনে রাখুন)।
3. **Network Access** → **Add IP Address** → `0.0.0.0/0` (development-এর জন্য)।
4. **Connect ▸ Drivers** → connection string কপি করুন, দেখতে হবে:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. `.env.local`-এ বসান:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=labonno
   ```
   > Atlas সবসময় replica set — তাই transaction (order create) কাজ করবে।

**অপশন B — নিজের কম্পিউটারে MongoDB (macOS / Linux / WSL)**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community@7.0
# Ubuntu/Debian: https://www.mongodb.com/docs/manual/installation/

npm run db:mongo          # rs0 replica set চালু করে (.mongo-data ফোল্ডারে)
```
`.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=labonno
```
> ⚠️ সাধারণ `mongod` চালালে হবে না — অবশ্যই **replica set** লাগবে (transaction-এর জন্য)। `npm run db:mongo` স্ক্রিপ্টটা সেটাই করে। Windows-এ সরাসরি mongod না চালিয়ে **Atlas** বা **WSL** ব্যবহার করুন।

### ধাপ ৪ — ইনস্টল, seed, চালু
```bash
npm install         # ~1 মিনিট
npm run seed        # demo catalogue, 16 products, pages, FAQ, demo orders
npm run dev         # http://localhost:3000
```

### ধাপ ৫ — লগইন
| কোথায় | URL | Email | Password |
| --- | --- | --- | --- |
| Admin panel | http://localhost:3000/admin/login | `admin@labonno.com` | `Labonno@2026` |
| Staff (admin role) | একই | `manager@labonno.com` | `Labonno@2026` |
| Customer | http://localhost:3000/login | `customer@labonno.com` | `Labonno@2026` |

> এগুলো **ডেমো** পাসওয়ার্ড। লাইভ করার আগে `.env.local`-এ `SEED_ADMIN_PASSWORD` ইত্যাদি বদলে আবার `npm run seed` চালান, অথবা admin panel থেকে পাসওয়ার্ড বদলান।

### ধাপ ৬ — সব ঠিক আছে কিনা যাচাই
```bash
npm run typecheck   # টাইপ চেক — কোনো error আসা উচিত নয়
npm run smoke       # DB + business logic test — 40টি check pass করবে
```

### সমস্যা হলে (Troubleshooting)
| Symptom | কারণ / সমাধান |
| --- | --- |
| `MONGODB_URI is not set` | `.env.local` ফাইল root-এ নেই বা নাম ভুল (`.env.local`, `.env.local.txt` নয়) |
| `Transaction numbers are only allowed on a replica set member` | সাধারণ mongod চলছে — `npm run db:mongo` ব্যবহার করুন বা Atlas নিন |
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB চালু নেই → `npm run db:mongo` |
| Homepage ফাঁকা / কোনো প্রোডাক্ট নেই | `npm run seed` চালাননি |
| `better-auth` session কাজ করছে না | `BETTER_AUTH_URL` ও `NEXT_PUBLIC_SITE_URL` একই origin হতে হবে (`http://localhost:3000`) |
| `next build` মেমোরির জন্য মরে যাচ্ছে (SIGKILL) | কমপক্ষে **4 GB free RAM** লাগবে (নিচে §4 দেখুন) |
| `npm run dev` port busy | `npx next dev -p 3001` |

### VS Code-এ দৈনন্দিন কমান্ড
```bash
npm run dev          # dev server (hot reload)
npm run typecheck    # টাইপ চেক
npm run lint         # ESLint
npm run smoke        # data-layer test
npm run seed         # demo data আবার ঢোকানো (সাবধান: catalogue reset হয়)
```

---

## 3. কী কী বাকি — দুই ভাগে

### 🅐 আমি (ডেভেলপার/এজেন্ট) করে দিতে পারি — আপনার শুধু "করে দিন" বলা লাগবে

| # | কাজ | কেন দরকার | যা লাগবে আমার কাছে |
| --- | --- | --- | --- |
| A1 | **Production build যাচাই** — `npm run build` চালিয়ে কোনো build-only error (metadata, lint, static analysis) ঠিক করা | এই স্যান্ডবক্সে RAM ২ GB, তাই build মরে যায়; আপনার মেশিনে বা CI-তে চালাতে হবে | ৪ GB+ RAM মেশিন বা Vercel access |
| A2 | **Order confirmation email / notification** — এখন কোনো email যায় না (কাস্টমার order দিলে বা status বদলালে মেইল পায় না) | বাস্তব ব্যবসার জন্য জরুরি | একটি provider: Resend / SendGrid / Gmail SMTP + API key |
| A3 | **End-to-end (Playwright) test** — cart → checkout → order, admin flow গুলো স্বয়ংক্রিয়ভাবে টেস্ট | regression আটকাতে | বড় স্যান্ডবক্স (Chromium ~300 MB RAM) |
| A4 | **SSLCommerz sandbox test** — আসল credential দিয়ে payment round-trip | এখন কোড লেখা আছে কিন্তু আসল gateway-এ টেস্ট হয়নি | `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` (sandbox) |
| A5 | **SEO pass** — JSON-LD (Product/Organization/Breadcrumb), OpenGraph image, canonical audit | Google-এ ভালো র‍্যাংকিং | কিছু লাগবে না |
| A6 | **Backup + export** — `mongodump` স্ক্রিপ্ট, orders/customers CSV export | ডেটা সেফটি | কিছু লাগবে না |
| A7 | **Performance/Accessibility audit** — Lighthouse, image size, contrast | speed + accessibility | কিছু লাগবে না |

### 🅑 শুধু আপনি করতে পারবেন — কীভাবে (step by step)

#### B1. Cloudinary account (ছবি হোস্টিং) — ৫ মিনিট, ফ্রি
1. https://cloudinary.com → **Sign up free**।
2. Dashboard-এ **Cloud name**, **API Key**, **API Secret** কপি করুন।
3. `.env.local`-এ বসান:
   ```env
   CLOUDINARY_CLOUD_NAME=xxxx
   CLOUDINARY_API_KEY=xxxx
   CLOUDINARY_API_SECRET=xxxx
   CLOUDINARY_UPLOAD_FOLDER=labonno
   ```
4. Admin → **Media library** থেকে ছবি upload করে দেখুন।
> না করলে upload গুলো `public/uploads/`-এ সেভ হবে (শুধু local/dev-এ কাজ করবে, Vercel-এ হারিয়ে যাবে) — তাই লাইভে Cloudinary লাগবেই।

#### B2. Payment gateway (bKash / Nagad / SSLCommerz)
- **bKash merchant**: https://www.bkash.com/en/business → Merchant account (ট্রেড লাইসেন্স, TIN, ব্যাংক statement লাগে; approval ১–৩ সপ্তাহ)। এখন সিস্টেমে bKash/Nagad = **manual transfer + staff verification** (কাস্টমার TrxID দেয়, আপনি Orders স্ক্রিনে verify করে "paid" দেন) — এটা এখনই কাজ করে।
- **নগদ merchant**: https://nagad.com.bd → Merchant।
- **SSLCommerz (কার্ড/ইন্টারনেট ব্যাংকিং)**: https://developer.sslcommerz.com → Sandbox registration (তাৎক্ষণিক)। Sandbox-এ store ID + password পেলে আমাকে দিন, আমি integration test করে দেব।
- লাইভ হওয়ার পর `.env.local`-এ বসাবেন:
  ```env
  SSLCOMMERZ_STORE_ID=xxxx
  SSLCOMMERZ_STORE_PASSWORD=xxxx
  SSLCOMMERZ_SANDBOX=false
  ```
  এবং SSLCommerz panel-এ IPN URL: `https://<your-domain>/api/payments/sslcommerz/ipn`
  (success: `…/success`, fail: `…/fail`, cancel: `…/cancel`)

#### B3. ডোমেইন কেনা + সেট করা
1. ডোমেইন কিনুন (Namecheap / GoDaddy / .com.bd-এর জন্য BTCL)।
2. Vercel-এ deploy করার পর `.env.local`/Vercel env-এ:
   ```env
   NEXT_PUBLIC_SITE_URL=https://labonno.com
   BETTER_AUTH_URL=https://labonno.com
   ```
   > এই দুটো ভুল থাকলে login cookie ও payment redirect কাজ করবে না।

#### B4. আসল ছবি ও কনটেন্ট
- এখন ডেমো ছবি (Unsplash/stock) + ডেমো টেক্সট আছে — লাইভে **নিজের প্রোডাক্টের ছবি** দরকার: মডেল শট + mannequin/flat-lay + fabric detail মিশিয়ে (শুধু মডেল শট নয়)।
- Admin → **Products**-এ প্রতিটি প্রোডাক্টের ছবি, size/color/stock বসান।
- Admin → **Pages**-এ Privacy, Return, Shipping policy, Size guide, About — আপনার আসল শর্ত অনুযায়ী লিখুন (এখন real draft আছে, কিন্তু আপনার ব্যবসার শর্ত আপনারই ঠিক করতে হবে)।

#### B5. Production database (MongoDB Atlas) + seed
1. Atlas-এ production cluster বানান (একই অ্যাকাউন্টে নতুন cluster, অথবা একই cluster-এ নতুন DB name)। Atlas **M0 free** দিয়ে শুরু করা যাবে, পরে M10-এ upgrade।
2. `MONGODB_URI` = production string → `.env.local` (বা সরাসরি Vercel env)।
3. **লোকাল `.env.local`-এ production URI রেখে** একবার:
   ```bash
   npm run seed
   ```
   ⚠️ `seed` demo data ঢোকে — production-এ চালানোর আগে `.env.local`-এ নিজের `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` সেট করুন, এবং seed-এর পর ডেমো প্রোডাক্ট/অর্ডার admin panel থেকে ডিলিট করুন (অথবা বলবেন, আমি একটা `--catalogue-only` ফ্ল্যাগ যোগ করে দেব)।

#### B6. Deploy (Vercel)
1. https://vercel.com → GitHub দিয়ে login → **Add New ▸ Project** → আপনার `labonno` repo import।
2. **Settings ▸ Environment Variables**-এ §B1/B2/B3-এর সব variable বসান (Production + Preview)।
3. Deploy → বিল্ড Vercel-এর সার্ভারে হবে (আপনার PC-র RAM লাগবে না)।
4. Deploy শেষে ডোমেইন attach করুন → SSL অটো হয়ে যাবে।
5. `https://<domain>/sitemap.xml` ও `/robots.txt` খুলে দেখুন।

#### B7. Final UAT (আপনার নিজের হাতে টেস্ট) — launch-এর আগে বাধ্যতামূলক
- [ ] Homepage-এর প্রতিটি section ঠিক দেখাচ্ছে (Admin → Homepage থেকে order বদলে দেখুন)
- [ ] `/shop` — filter (size/color/price), sort, pagination
- [ ] Product page → add to cart → checkout → **COD** order → admin-এ order এলো
- [ ] **bKash** manual: TrxID দিয়ে order → admin "pending verification" → verify করে paid
- [ ] **SSLCommerz** sandbox: কার্ড দিয়ে payment → auto paid + status confirmed
- [ ] Customer account: register, login, order history, wishlist, profile update
- [ ] `/track-order` — order number + ফোন দিয়ে tracking
- [ ] Admin: নতুন product বানানো/এডিট/ডিলিট, stock adjust, coupon বানানো, review approve
- [ ] Admin: role change (super admin দিয়ে), Reports date filter
- [ ] Mobile-এ সব পেজ (রেসপন্সিভ)
- [ ] Newsletter subscribe + contact form

---

## 4. প্রোডাকশন build সম্পর্কে (গুরুত্বপূর্ণ)

`npm run build` (production build) চালাতে **কমপক্ষে 4 GB free RAM** লাগবে — build-এর peak memory ~1.2–1.5 GB। এই স্যান্ডবক্সে মাত্র ~800 MB free ছিল, তাই build বারবার killed হয়েছে (webpack ও Turbopack দুই ভাবেই)। এটা কোডের সমস্যা নয় — `tsc --noEmit` clean এবং 40টি data-layer test pass।

তাই:
- **আপনার PC-তে**: 4 GB+ free RAM থাকলে সরাসরি `npm run build` চালান।
- **আরামে**: GitHub-এ push করে Vercel-এ deploy করুন — build ওখানেই হবে।
- Build-এ কোনো error উঠলে সেটা আমাকে পাঠান, আমি ঠিক করে দেব (A1)।

---

## 5. এখন কী যাচাই করা হয়েছে, আর কী হয়নি

**যাচাই হয়েছে:** TypeScript strict check (clean), 40টি data-layer test (catalogue, filter, search, coupon, order create, tracking, status ladder, payment mark, reports, newsletter), HTTP test (homepage render, admin login + session, middleware redirect, newsletter, wishlist 401/200)।

**যাচাই হয়নি (উপরের সীমাবদ্ধতার কারণে):** production build, admin panel-এর ব্রাউজার walkthrough, Cloudinary upload (credential নেই), SSLCommerz আসল gateway round-trip (credential নেই)। বিস্তারিত: `docs/verification.md`।

---

## 6. আমার কাছে যা পাঠালে আমি এগিয়ে যেতে পারব

1. SSLCommerz sandbox **Store ID + Store Password** (A4 করার জন্য)
2. Cloudinary **Cloud name / API key / API secret** (upload test-এর জন্য) — অথবা শুধু "আমি নিজে করে নেব" বলুন
3. Email provider পছন্দ: **Resend** / SendGrid / নিজের SMTP — কোনটা চান (A2)
4. 4 GB+ RAM মেশিন বা Vercel repo access (A1 build verify)
5. আসল প্রোডাক্টের ছবি/তালিকা (যাতে ডেমো ডেটার বদলে আসল ক্যাটালগ বসানো যায়)

> **নিরাপত্তা:** কোনো secret (API key, password) আমাকে chat-এ পাঠানোর দরকার নেই — আপনি নিজের `.env.local` বা Vercel-এ বসালেই হবে। শুধু "configured" বলে জানালে আমি test করে দেখতে পারব।

---

## 7. দলিলপত্র (এই রিপোতে)

| ফাইল | কী আছে |
| --- | --- |
| `README.md` | সেটআপ, env variable, script, deploy |
| `docs/architecture.md` | data model, layer boundaries, order lifecycle, payment flow |
| `docs/admin-guide.md` | স্টুডিও স্টাফের জন্য admin panel-এর ব্যবহারবিধি |
| `docs/verification.md` | কী টেস্ট হয়েছে, কী হয়নি — সৎ রেকর্ড |
| `docs/HANDOVER.md` | এই ফাইল |
