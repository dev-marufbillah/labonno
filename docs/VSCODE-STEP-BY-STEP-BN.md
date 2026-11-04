# VS Code-এ এখন ঠিক কী কী করতে হবে (ধাপে ধাপে)

> এই ফাইলটা ধাপে ধাপে ফলো করলেই হবে। প্রতিটা ধাপে **কী লিখতে হবে** আর **কী দেখা উচিত** দুটোই দেওয়া আছে।
> কোনো ধাপে আটকে গেলে নিচের "সমস্যা → সমাধান" টেবিল দেখুন।

---

## ধাপ ০ — আগে ফাইল নামান (একবার)

Workspace থেকে এই ফাইলটা ডাউনলোড করুন:

| ফাইল | কখন নেবেন |
| --- | --- |
| **`LABONNO-kit-2026-11-03.zip`** (6.7 MB) | **এটাই নিন** — পুরো প্রজেক্ট, স্পিড + অ্যানিমেশন + পাসওয়ার্ড ফিক্স সব সহ |
| `LABONNO-speed-update.zip` / `LABONNO-password-fix.zip` | শুধু তখন, যখন আপনার কম্পিউটারে আগের প্রজেক্ট ফোল্ডারটা আছেই |

তারপর zip টা Extract করুন। ভেতরে `labonno` ফোল্ডার পাবেন।

---

## ধাপ ১ — VS Code-এ **সঠিক ফোল্ডার** খুলুন

1. VS Code খুলুন → `File → Open Folder…`
2. **`labonno`** ফোল্ডারটা সিলেক্ট করুন (যেটার ভেতরে `package.json`, `app`, `lib` আছে)
3. বাঁ দিকে Explorer-এ `package.json` দেখা যাচ্ছে = ঠিক আছে ✅

> ⚠️ ভুল করবেন না: zip-এর বাইরের ফোল্ডার (যেখানে `labonno.zip` আছে) খুললে কিছুই কাজ করবে না।

---

## ধাপ ২ — টার্মিনাল খুলুন

- শর্টকাট: **`Ctrl + `** (Windows) / **`Cmd + `** (Mac)
  অথবা মেনু থেকে `Terminal → New Terminal`
- নিচে কালো প্যানেল আসবে। টার্মিনালে পাথ দেখাবে `...\labonno>` — এটাই ঠিক।
- **সব কমান্ড নিচের প্যানেলে লিখে Enter দেবেন**, উপরের দিকে নয়।

---

## ধাপ ৩ — প্যাকেজ ইনস্টল (একবার, ২–৪ মিনিট)

```bash
npm install
```

**দেখা উচিত:** `added 500+ packages` ধরনের লাইন, শেষে error নেই।
`node_modules` ফোল্ডার তৈরি হবে (এটা কখনো zip/গিটে দিতে হয় না)।

---

## ধাপ ৪ — `.env.local` ঠিক করা (ডেটাবেস + সিক্রেট)

প্রথমবার হলে ফাইলটা নেই। এই কমান্ড চালান:

```bash
npm run setup
```

এটা `.env.local` বানায় আর `BETTER_AUTH_SECRET` নিজেই generate করে দেয়।
এরপর VS Code-এ **`.env.local`** ফাইলটা খুলুন এবং এক লাইন ঠিক করুন:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=labonno
```

- `MONGODB_URI` = Atlas থেকে কপি করা connection string (পাসওয়ার্ডে special character থাকলে URL-encode করুন)
- **Atlas ব্যবহার করলে:** `Network Access`-এ `0.0.0.0/0` (আজকের জন্য) যোগ করে দিন, নাহলে কানেক্ট হবে না
- **নিজের পিসিতে MongoDB থাকলে:** `MONGODB_URI=mongodb://127.0.0.1:27017`

**ছবি হোস্টিং (Cloudinary) — আপনার key রেডি:**

```env
CLOUDINARY_CLOUD_NAME=hwynbmrx
CLOUDINARY_API_KEY=775512911932391
CLOUDINARY_API_SECRET=আপনার সিক্রেট
CLOUDINARY_UPLOAD_FOLDER=labonno
```

অথবা Cloudinary ড্যাশবোর্ডের এক লাইনটাই বসান:
```env
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@hwynbmrx
```

চেক করতে: `npm run check:cloudinary` → `upload ok: true` দেখলেই ঠিক।

**ঐচ্ছিক (পরে যোগ করলেও চলবে):**

```env
RESEND_API_KEY=            # অর্ডার কনফার্মেশন ইমেইল (resend.com)
EMAIL_FROM="Labonno <orders@yourdomain.com>"
BKASH_APP_KEY=             # bKash অটো পেমেন্ট (না দিলেও ম্যানুয়াল bKash চলবে)
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_SANDBOX=true
NEXT_PUBLIC_GA_ID=         # Google Analytics
NEXT_PUBLIC_META_PIXEL_ID= # Meta Pixel
```

> 🔒 `.env.local` কখনো কোথাও শেয়ার/আপলোড করবেন না — এতে পাসওয়ার্ড থাকে।

---

## ধাপ ৫ — ডেটাবেস ও অ্যাকাউন্ট তৈরি

দুটো আলাদা কমান্ড, দুটোই দরকার:

```bash
npm run seed:users
```
→ ৩টা অ্যাকাউন্ট বানায় / পাসওয়ার্ড ঠিক করে, আর **পাসওয়ার্ডগুলো স্ক্রিনে ছাপে**:
```
super_admin  admin@labonno.com     Labonno@2026   (created)
admin        manager@labonno.com   Labonno@2026   (created)
customer     customer@labonno.com  Labonno@2026   (created)
```

```bash
npm run seed
```
→ ডেমো ডেটা: প্রোডাক্ট, ক্যাটাগরি, কালেকশন, স্লাইডার, কুপন, রিভিউ, ৮টা অর্ডার।
⚠️ এটা **ক্যাটালগ রিসেট** করে (আপনার নিজের যোগ করা ডেটা মুছে যাবে)। শুধু অ্যাকাউন্ট দরকার হলে এটা বাদ দিন।

---

## ধাপ ৬ — সাইট চালু

```bash
npm run dev
```

**দেখা উচিত:**
```
▲ Next.js 15
- Local: http://localhost:3000
✓ Ready in 2s
```

এবার ব্রাউজারে খুলুন:

| কী | লিংক |
| --- | --- |
| দোকান (storefront) | http://localhost:3000 |
| **অ্যাডমিন প্যানেল** | http://localhost:3000/admin/login |
| অ্যাকাউন্ট আছে কি না দেখতে | http://localhost:3000/api/health |

অ্যাডমিন লগইন: `admin@labonno.com` / `Labonno@2026`

> `npm run dev` চলা অবস্থায় টার্মিনালটা ব্যস্ত থাকে — এটা বন্ধ করবেন না।
> থামাতে চাইলে টার্মিনালে **`Ctrl + C`**।
> নতুন কমান্ড চালাতে **আরেকটা টার্মিনাল** খুলুন: টার্মিনাল প্যানেলের `+` বাটন।

---

## ধাপ ৭ — সব ঠিক আছে কি না যাচাই (৩টা চেক)

```bash
npm run smoke
```
→ শেষে `40 passed, 0 failed` আসবে (অর্ডার, কুপন, ক্যাটালগ, CMS — সব টেস্ট)

```bash
npm run bench
```
→ ক্যাশের গতি: `warm` কলামে ০.০১ ms ধরনের সংখ্যা (ডেটা দ্রুত আসছে)

```bash
npm run typecheck
```
→ কোনো লাইন ছাড়াই শেষ হবে = কোডে ভুল নেই

আর লগইন নিয়ে কোনো সন্দেহ থাকলে (সার্ভার চালু রেখে, **অন্য টার্মিনালে**):
```bash
npm run doctor
```
→ এনভায়রনমেন্ট, ডেটাবেস, ৩টা অ্যাকাউন্ট, পাসওয়ার্ড মিলছে কি না, আর আসল sign-in রিকোয়েস্ট — সব একসাথে চেক করে শেষে **"Next steps"**-এ কী করতে হবে বলে দেয়।

আর ব্রাউজারে `http://localhost:3000/api/health` খুলে দেখুন:
```json
{ "ok": true, "database": { "connected": true, "users": 3, "admins": 2 }, "warnings": [] }
```
`users: 3` আর `warnings: []` = সব ঠিক।

---

## ধাপ ৮ — যা যা নিজে বদলাতে পারবেন (কোড ছোঁয়া লাগবে না)

অ্যাডমিন প্যানেলে (`/admin/login`) ঢুকে বাঁ দিকের মেনু থেকে:

| কাজ | কোথায় |
| --- | --- |
| সাইটের নাম, ট্যাগলাইন, announcement | Settings → General |
| লোগো, ফ্যাভিকন, ব্র্যান্ড কালার | Settings → Appearance |
| হোমপেজের স্লাইডার (যোগ/এডিট/ডিলিট/অর্ডার) | Banners |
| প্রোডাক্ট যোগ/এডিট, ছবি আপলোড | Products |
| ক্যাটাগরি / কালেকশন | Categories, Collections |
| হোমপেজের সেকশন শো/হাইড ও ক্রম | Homepage |
| কুপন কোড | Marketing → Discounts |
| হেডার/ফুটার মেনু | Navigation |
| পেজ, FAQ | Pages |
| অর্ডার, স্টক, রিপোর্ট | Orders, Inventory, Reports |

---

## সমস্যা → সমাধান

| যা দেখছেন | কারণ | সমাধান |
| --- | --- | --- |
| `Wrong email or password` | পাসওয়ার্ড মেলেনি | `npm run seed:users` → আবার লগইন। না হলে `npm run doctor` চালিয়ে আউটপুট দেখুন |
| পাসওয়ার্ড বদলেছি, তবু একই এরর | সার্ভার পুরোনো কোড/সেশন ধরে আছে | টার্মিনালে `Ctrl + C` → `npm run dev` → ব্রাউজারে `Ctrl + Shift + R` |
| `EADDRINUSE :3000` | আগের সার্ভার চলছে | পুরোনো টার্মিনালে `Ctrl + C`, নাহলে `npm run dev -- -p 3001` |
| `Transaction numbers are only allowed on a replica set member or mongos` | লোকাল mongod standalone — অ্যাকাউন্ট বানাতে transaction লাগে | কোড নিজেই ফলব্যাক করে; চাইলে `.env.local`-এ `MONGODB_TRANSACTIONS=false` |
| `ECONNREFUSED` / `MongoServerSelectionError` | ডেটাবেসে পৌঁছাচ্ছে না | `.env.local`-এ `MONGODB_URI` ঠিক করুন; Atlas হলে IP allowlist-এ `0.0.0.0/0` |
| `users: 0` (health-এ) | অ্যাকাউন্ট তৈরি হয়নি | `npm run seed:users` |
| `trusted: false` (health-এ) | URL মিলছে না | health-এ দেখানো `expected` URL দিয়ে সাইট খুলুন |
| `Cannot find module ...` | `npm install` হয়নি | `npm install` চালান |
| `localhost:3000` খুলছে না | সার্ভার চলছে না | `npm run dev` চালু আছে কি না দেখুন |
| সেটিংস সেভ হচ্ছে না | লগইন সেশন নেই | আবার `/admin/login` থেকে লগইন করুন |
| পোর্ট ৩০০০ বদলাতে চাই | — | `.env.local`-এ `NEXT_PUBLIC_SITE_URL` + `BETTER_AUTH_URL` দুটোই নতুন পোর্টে দিন |

---

## যা **করবেন না**

- ❌ `npm run build` — এই মুহূর্তে দরকার নেই (কম RAM মেশিনে আটকে যেতে পারে); `npm run dev`-ই যথেষ্ট
- ❌ `.env.local`, `node_modules`, `.next` — কোথাও আপলোড/শেয়ার/গিটে পুশ করবেন না
- ❌ zip-এর ভেতরের ফাইলগুলো আলাদা করে সরানো — পুরো `labonno` ফোল্ডার একসাথে রাখুন

---

## কাজ শেষ হলে

```bash
Ctrl + C      # সার্ভার বন্ধ
```
পরেরবার আবার খুলতে: VS Code → Open Folder → `npm run dev` → `localhost:3000`।

ব্যস — এতটুকুই। ধাপ ৭-এ `40 passed, 0 failed` আর `users: 3` দেখলেই বুঝবেন সব ঠিক আছে।
