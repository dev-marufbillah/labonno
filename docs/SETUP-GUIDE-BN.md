# LABONNO — অ্যাডমিন গাইড ও সেটআপ (বাংলা)

এই ডকুমেন্টে দুইটা জিনিস আছে:
**অংশ ১** — অ্যাডমিন প্যানেল থেকে কী কী করতে পারবেন (কোথায় গিয়ে)।
**অংশ ২** — ছবি, পেমেন্ট, Google login, ডেটাবেস — এগুলোর জন্য কী কী key/account লাগবে, কোথা থেকে পাবেন, কোথায় বসাবেন।

---

# অংশ ১ — অ্যাডমিন প্যানেলে কী কী করতে পারবেন

লগইন: **`https://<আপনার-ডোমেইন>/admin/login`** (লোকালে `http://localhost:3000/admin/login`)
অ্যাকাউন্ট: `admin@labonno.com` / `Labonno@2026` (পরে বদলে নিন)

| আপনি যা করতে চান | কোথায় যাবেন | কীভাবে |
| --- | --- | --- |
| **সাইটের নাম (brand name) বদলানো** | Settings ▸ **General** | "Brand name" ও "Brand name (Bangla)" বদলে Save। হেডার, ফুটার, পেজের টাইটেল — সব জায়গায় বদলে যাবে (রিস্টার্ট লাগে না) |
| সাইটের ট্যাগলাইন / announcement bar | Settings ▸ **General** | "Tagline", "Announcement bar" (উপরে সরু বার) |
| **লোগো ও ফেভিকন** | Settings ▸ **Appearance** | "Logo image" ও "Favicon" — সরাসরি upload। খালি রাখলে টাইপোগ্রাফিক নাম দেখাবে |
| **ব্র্যান্ড কালার** | Settings ▸ **Appearance** | "Accent colour (hex)" — বাটন, লিংক, হোভার — সব জায়গায় লাগবে |
| **একাধিক হোম স্লাইডার (hero)** | Content ▸ **Banners** | "New banner" → Placement = **Homepage hero slide** → ছবি upload → Order দিয়ে সিরিয়াল ঠিক করুন। যত চান তত slide যোগ করুন (অটো ৭ সেকেন্ডে ঘোরে, ডট দিয়ে হাতেও বদলানো যায়) |
| **স্লাইডার লুকানো/দেখানো** | Content ▸ **Banners** | প্রতি banner-এর "Visible" সুইচ (বা এডিট করে) |
| প্রোমো ব্যানার / পপআপ | Content ▸ **Banners** | একই ফর্মে Placement = Promotional strip / Popup |
| **নতুন প্রোডাক্ট যোগ** | Catalogue ▸ **Products ▸ New product** | নাম, দাম, ক্যাটাগরি, ছবি (একাধিক), size × colour × stock |
| **প্রোডাক্ট এডিট / ডিলিট** | Catalogue ▸ **Products** | লিস্টে প্রতিটা সারিতে Edit / Delete (ডিলিটে confirmation আসবে) |
| প্রোডাক্ট হোমপেজে দেখানো | Products | "Featured", "Best seller", "New arrival" ফ্ল্যাগ অন/অফ |
| **ক্যাটাগরি যোগ / এডিট / ডিলিট** | Catalogue ▸ **Categories** | নাম, slug, ছবি, order, Visible |
| কালেকশন (curated edit) | Catalogue ▸ **Collections** | উপরের মতোই |
| **স্টক আপডেট** | Catalogue ▸ **Inventory** | Adjust — প্রতিটা পরিবর্তন লগে থাকে (কিছু বদলেছে কে, কেন) |
| **অর্ডার দেখা ও স্ট্যাটাস বদল** | Orders | pending → confirmed → processing → shipped → delivered (অবৈধ ধাপ দেখাবে না) |
| **পেমেন্ট verify করা (bKash/Nagad)** | Orders ▸ অর্ডার খুলুন ▸ Payment | কাস্টমারের TrxID দেখে নিজের অ্যাপে মিলিয়ে "paid" দিন |
| **কুপন / অফার কোড বানানো** | Marketing ▸ **Discounts** | code, % বা fixed টাকা, min order, ব্যবহারের সীমা, শুরুর ও শেষের তারিখ |
| **রিভিউ approve করা** | Marketing ▸ **Reviews** | নতুন রিভিউ pending থাকে — approve করলেই প্রোডাক্ট পেজে দেখাবে |
| **হোমপেজের সেকশন শো/হাইড ও অর্ডার** | Content ▸ **Homepage** | প্রতিটা সেকশন (hero, categories, featured, best-sellers, editorial, newsletter) — চোখের আইকনে hide/show, তীর দিয়ে উপরে-নিচে |
| কনটেন্ট পেজ (About, Policy, Size guide) | Content ▸ **Pages** | এডিট/নতুন; "Show in footer" দিলে ফুটারে লিংক আসবে |
| FAQ যোগ করা | Content ▸ **Pages** (FAQ টেবিল) | প্রশ্ন, উত্তর, ক্যাটাগরি |
| **মেনু ও ফুটার লিংক** | Content ▸ **Navigation** | `Label\|/url` ফরম্যাটে লিখুন; সাব-মেনুও হবে |
| **ছবি আপলোড করে URL নেওয়া** | Content ▸ **Media library** | ছবি ড্র্যাগ করুন, URL কপি করে যেকোনো জায়গায় বসান |
| **কাস্টমার/স্টাফ রোল** | Settings ▸ **Admin users** | super admin দিয়ে promote/demote (নিজের রোল বদলানো যায় না) |
| রিপোর্ট (তারিখ ধরে আয়) | Reports | তারিখ বেছে নিন → revenue, অর্ডার, top product |
| নিজের প্রোফাইল/পাসওয়ার্ড | Profile | নাম, ফোন, পাসওয়ার্ড |

> ছোট নোট: প্যানেলে কিছু Save করলে **সাথে সাথেই** সাইটে দেখা যাবে — কোনো "publish" বা রিস্টার্ট লাগে না।

---

# অংশ ২ — কী কী account/key লাগবে

## ২.১ MongoDB (ডেটাবেস) — সবার আগে এটা

কেন: প্রোডাক্ট, অর্ডার, কাস্টমার — সব ডেটা এখানে থাকে।

**কী লাগবে:** একটা MongoDB Atlas free cluster আর তার connection string (`mongodb+srv://…`)।

ধাপ:
1. https://www.mongodb.com/cloud/atlas/register → ফ্রি সাইন আপ।
2. **Create** → **M0 Free** → region Singapore/Mumbai → **Create Deployment**।
3. **Database Access** → **Add New Database User** → username + password (শুধু letter+number)।
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (ডেভেলপমেন্টে; লাইভে সার্ভারের IP দিলে ভালো)।
5. **Connect ▸ Drivers** → connection string কপি।

`.env.local`-এ বসান:
```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=labonno
```

---

## ২.২ ছবি আপলোড (Cloudinary) — অ্যাডমিন থেকে নিজের ছবি দেওয়ার জন্য

**এখন কী হয়:** Cloudinary set না থাকলে ছবি আপনার কম্পিউটারের `public/uploads/` ফোল্ডারে জমা হয় — শুধু নিজের PC-তে দেখা যায়। **লাইভ সাইটে ছবি upload করতে Cloudinary লাগবেই।**

**কী লাগবে (৩টা key):**
| Key | কোথায় পাবেন |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard-এর উপরে "Cloud name" |
| `CLOUDINARY_API_KEY` | একই পেজে "API Key" |
| `CLOUDINARY_API_SECRET` | "API Secret" (Reveal চাপুন) |

ধাপ:
1. https://cloudinary.com/users/register_free → ফ্রি অ্যাকাউন্ট (কার্ড লাগে না, মাসে ২৫ credits ফ্রি — ছোট দোকানের জন্য যথেষ্ট)।
2. https://console.cloudinary.com → **Dashboard** → উপরে **Product Environment / Cloud name** দেখবেন।
3. নিচে **API Keys** → **API Key / API Secret** কপি করুন।
4. `.env.local`-এ বসান:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CLOUDINARY_UPLOAD_FOLDER=labonno
```
5. Vercel-এ deploy করলে ওখানেও একই ৩টা key বসাতে হবে।
6. **টেস্ট:** Admin → Media library → ছবি upload → সফল হলে নিচে লেখা থাকবে না "local uploads"; আর ছবির URL হবে `res.cloudinary.com/...` দিয়ে শুরু।

> ছবি না দেওয়া পর্যন্তও প্যানেলের সব ফিচার চলবে — শুধু আপনার নিজের ছবি আপলোড করা যাবে না।

---

## ২.৩ Payment (পেমেন্ট) সেটআপ

তিন ধরনের পেমেন্ট আছে; প্রতিটার জন্য আলাদা জিনিস লাগে। **যেটা configure করবেন না, সেটা checkout-এ দেখাবে না** — তাই ভাঙা বাটন থাকবে না।

### (ক) Cash on Delivery — কিছুই লাগে না
Settings ▸ Payments-এ on রাখলেই হবে।

### (খ) bKash / Nagad — "send money → TrxID" (আজই চালু করা যায়, কোনো API key লাগে না)
1. আপনার **bKash Merchant** (বা personal, শুরুতে) নম্বর আর **Nagad** নম্বর ঠিক করুন।
2. Admin → Settings ▸ **Payments** → bKash/Nagad নম্বর বসান, "Manual transfer" mode on করুন।
3. কাস্টমার checkout-এ ওই নম্বরে send money করে **TrxID** লিখবে।
4. অর্ডার আসবে `pending verification` স্ট্যাটাসে → আপনি bKash অ্যাপে মিলিয়ে Orders ▸ Payment থেকে **paid** দেবেন।

**আসল merchant API (auto-payment)** চাইলে: https://www.bkash.com/en/business/online-payment → merchant account (ট্রেড লাইসেন্স, TIN, ব্যাংক স্টেটমেন্ট লাগে; অনুমোদন ১–৩ সপ্তাহ)। অনুমোদনের পর API key/secret পেলে কোডে জুড়ে দিতে হবে (এখন ম্যানুয়াল পদ্ধতিই চালু)।

### (গ) SSLCommerz — কার্ড / ইন্টারনেট ব্যাংকিং (auto-verified)
**কী লাগবে:** `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`।

ধাপ:
1. https://developer.sslcommerz.com/registration/ → **Sandbox** অ্যাকাউন্ট (তাৎক্ষণিক, ফ্রি)।
2. ইমেইলে store ID + password পাবেন (স্যান্ডবক্সে সাধারণত `sandbox…` prefix)।
3. `.env.local`-এ:
```env
SSLCOMMERZ_STORE_ID=yourstoreid
SSLCOMMERZ_STORE_PASSWORD=yourpassword
SSLCOMMERZ_SANDBOX=true
```
4. SSLCommerz panel-এ (Merchant Panel ▸ IPN) বসান:
   - IPN URL: `https://<ডোমেইন>/api/payments/sslcommerz/ipn`
   - Success: `https://<ডোমেইন>/api/payments/sslcommerz/success`
   - Fail: `https://<ডোমেইন>/api/payments/sslcommerz/fail`
   - Cancel: `https://<ডোমেইন>/api/payments/sslcommerz/cancel`
5. লাইভ হওয়ার পর `SSLCOMMERZ_SANDBOX=false` করে আসল store ID/password বসাবেন (লাইভের জন্য ব্যবসার ডকুমেন্ট লাগে)।

> টাকা পেমেন্টের পর সার্ভার নিজেই SSLCommerz-কে জিজ্ঞেস করে টাকার পরিমাণ মিলিয়ে দেখে, তারপর অর্ডার paid হয় — শুধু ব্রাউজার রিডাইরেক্টে ভরসা করা হয় না।

---

## ২.৪ Google দিয়ে সাইন-ইন (optional)

**কী লাগবে:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`।

ধাপ:
1. https://console.cloud.google.com → নতুন project বানান (নাম: LABONNO)।
2. **APIs & Services ▸ OAuth consent screen** → External → অ্যাপের নাম, support email, developer email দিন → Save।
3. **APIs & Services ▸ Credentials ▸ Create Credentials ▸ OAuth client ID** → Application type: **Web application**।
4. **Authorized redirect URIs** — ঠিক এই দুটো বসান:
```
http://localhost:3000/api/auth/callback/google
https://<আপনার-ডোমেইন>/api/auth/callback/google
```
5. Client ID ও Client secret কপি করে `.env.local`-এ:
```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
```
6. রিস্টার্ট দিলে লগইন পেজে "Continue with Google" বাটন নিজেই দেখাবে (key না থাকলে বাটনটাই দেখাবে না)।

---

## ২.৫ ইমেইল (অর্ডার কনফার্মেশন) — এখনো নেই

এখন কাস্টমার অর্ডার করলে কোনো ইমেইল যায় না। চাইলে যেকোনো একটা বেছে নিন:
- **Resend** — https://resend.com (সবচেয়ে সহজ, ফ্রি ৩,০০০ ইমেইল/মাস) → API key
- **SendGrid** — https://sendgrid.com
- নিজের **SMTP** (cPanel/Gmail app password)

কোনটা চান বললে আমি কোডে যোগ করে দেব (অর্ডার প্লেসড, স্ট্যাটাস চেঞ্জ, পেমেন্ট verified — তিনটার টেমপ্লেট)।

---

## ২.৬ ডোমেইন + হোস্টিং (Vercel)

1. ডোমেইন কিনুন — Namecheap / GoDaddy / `.com.bd` চাইলে BTCL বা lokal registrar।
2. https://vercel.com → GitHub দিয়ে login → **Add New ▸ Project** → আপনার repo import।
3. **Environment Variables**-এ §২.১–২.৫-এর সব key বসান।
4. Deploy → Domains-এ ডোমেইন যোগ করুন।
5. `.env.local`/Vercel-এ অবশ্যই ঠিক করুন:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
BETTER_AUTH_URL=https://yourdomain.com
```
> এই দুইটা ভুল থাকলে লগইন, পেমেন্ট redirect, সাইটম্যাপ — সব ভাঙবে।

---

## ২.৭ সব key একসাথে (এক নজরে)

| Key | কীসের জন্য | বাধ্যতামূলক? |
| --- | --- | --- |
| `MONGODB_URI`, `MONGODB_DB` | ডেটাবেস | ✅ হ্যাঁ |
| `BETTER_AUTH_SECRET` | লগইন সিকিউরিটি | ✅ হ্যাঁ |
| `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL` | সাইটের ঠিকানা | ✅ হ্যাঁ |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET/UPLOAD_FOLDER` | ছবি আপলোড | লাইভে হ্যাঁ |
| `SSLCOMMERZ_STORE_ID/STORE_PASSWORD/SANDBOX` | কার্ড পেমেন্ট | না (না দিলে বন্ধ থাকবে) |
| `GOOGLE_CLIENT_ID/SECRET` | Google login | না |
| `SEED_ADMIN_EMAIL/PASSWORD` | প্রথম অ্যাডমিন বানানো | seed চালানোর সময় |

`BETTER_AUTH_SECRET` বানান:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

# অংশ ৩ — kit থেকে নেওয়া ও চালানো

1. `LABONNO-kit-*.zip` ডাউনলোড → Extract → ভেতরের **`labonno`** ফোল্ডার VS Code-এ খুলুন।
   (অথবা: `git clone LABONNO-*.bundle labonno`)
2. Terminal:
```bash
npm install
npm run setup                   # .env.local বানাবে + secret বসাবে (নিজে কিছু লিখতে হবে না)
^ তারপর .env.local-এ শুধু MONGODB_URI বসান (+ পরে Cloudinary ইত্যাদি)
npm run seed                    # ডেটা ভরা
npm run dev                     # http://localhost:3000
```
3. Admin: `http://localhost:3000/admin/login` → `admin@labonno.com` / `Labonno@2026`

বিস্তারিত: `README.md`, `docs/HANDOVER.md`।

---

# অংশ ৪ — কাজের ক্রম (আমার পরামর্শ)

**আজ / এই সপ্তাহে**
1. MongoDB Atlas account + connection string (৩০ মিনিট)
2. `.env.local` সেট করে লোকালি সাইট চালু করা (৩০ মিনিট)
3. Admin-এ ঢুকে নিজের মতো করে সাজানো: নাম, লোগো, announcement, ২–৩টা slider, ১টা প্রোডাক্ট, ১টা ক্যাটাগরি (১ ঘণ্টা)

**পরের ধাপে**
4. Cloudinary account (ছবি আপলোড লাইভ করতে)
5. bKash/Nagad নম্বর ঠিক করে Settings ▸ Payments-এ বসানো (এখনই কাজ করবে)
6. আসল ছবি + প্রোডাক্ট তালিকা ভরা
7. Policy/About/Size guide লেখা

**লঞ্চের আগে**
8. SSLCommerz sandbox test → তারপর live store
9. ডোমেইন + Vercel deploy
10. ইমেইল নোটিফিকেশন (আমাকে বললে যোগ করব)
11. সব ডেমো পাসওয়ার্ড বদলানো, ডেমো প্রোডাক্ট ডিলিট করা
12. নিচের চেকলিস্ট ধরে হাতে-কলমে টেস্ট

## লঞ্চ চেকলিস্ট
- [ ] হোমপেজের সব সেকশন ঠিক, slider ঘুরছে
- [ ] `/shop` — filter, sort, pagination
- [ ] প্রোডাক্ট → cart → checkout → COD অর্ডার → admin-এ এলো
- [ ] bKash TrxID দিয়ে অর্ডার → verify → paid
- [ ] SSLCommerz sandbox পেমেন্ট → auto paid
- [ ] রেজিস্টার/লগইন (email + Google), wishlist, অর্ডার হিস্ট্রি
- [ ] `/track-order`
- [ ] admin-এ প্রোডাক্ট/ক্যাটাগরি/কুপন/রিভিউ/ব্যানার — সব যোগ-এডিট-ডিলিট
- [ ] মোবাইলে সব পেজ
- [ ] newsletter + contact form
- [ ] ছবি Cloudinary-তে যাচ্ছে (URL `res.cloudinary.com` দিয়ে শুরু)
