# `.env.local` আর Deploy — সব কী এক জায়গায়

> **নিয়ম ১টাই:** কোনো কী (API key) পেলে শুধু `.env.local`-এ পেস্ট করুন → dev server রিস্টার্ট → কাজ শুরু।
> কোডে কিছু বদলাতে হবে না। কেন্দ্রে হ্যাঁ, Vercel-এ ওই কী বসিয়ে Redeploy দিলেই হবে।

---

## ১) কোন কী কোথা থেকে

| সার্ভিস | কী লাগবে | কোথা থেকে | না দিলে কী হয় |
|---|---|---|---|
| **MongoDB** | `MONGODB_URI` (Atlas লিংক) | [cloud.mongodb.com](https://cloud.mongodb.com) → Connect → Drivers | সাইট চলবেই না |
| **Login secret** | `BETTER_AUTH_SECRET` | `npm run setup` নিজেই বানায় (রোটেট: `npm run setup -- --force`) | লগইন কাজ করবে না |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | [console.cloudinary.com](https://console.cloudinary.com/settings/api-keys) → Settings → API Keys | ছবি লোকাল `public/uploads`-এ জমা হবে (শুধু ডেভে) |
| **Resend (ইমেইল)** | `RESEND_API_KEY`, `EMAIL_FROM` | [resend.com/api-keys](https://resend.com/api-keys) → এরপর [resend.com/domains](https://resend.com/domains) এ ডোমেইন verify | অর্ডার হবে, ইমেইল যাবে না |
| **bKash (অটো)** | `BKASH_APP_KEY/SECRET/USERNAME/PASSWORD` | [developer.bka.sh](https://developer.bka.sh) মার্চেন্ট পোর্টাল | bKash **manual** হিসেবে চলবে (নম্বর + TrxID) |
| **Nagad** | `NAGAD_MERCHANT_ID`, `NAGAD_MERCHANT_PRIVATE_KEY` | [developer.mynagad.com](https://developer.mynagad.com) | manual Nagad চলবে |
| **কার্ড** | `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` | [developer.sslcommerz.com](https://developer.sslcommerz.com) | কার্ড অপশন লুকানো থাকবে |
| **Google লগইন** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → OAuth client → Web → redirect: `https://আপনার-ডোমেইন/api/auth/callback/google` | বাটন দেখাবে না |
| **Analytics** | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | GA4 / Meta Events Manager | কিছুই লোড হবে না |

## ২) নিজের চোখে দেখুন কোনটা চালু

```bash
npm run check:env     # ✔ ON / • FALLBACK / ✖ OFF — সিক্রেট দেখায় না
```

আর অ্যাডমিনে: **Admin → Everything** (`/admin/site`) → উপরে **Connected services** কার্ড —
কোন সার্ভিস চালু, কোনটা ফলব্যাক মোডে, এক নজরে। (কী/Api key পরিবর্তন করলে reload করলেই আপডেট)

## ৩) অ্যাডমিন থেকে যা টেস্ট করা যাবে (কী ছাড়াই)
- প্রোডাক্ট/ক্যাটাগরি/ব্যানার/কুপন/পেজ — add/delete
- অর্ডার — COD ও manual bKash (TrxID) দিয়ে পুরো ফ্লো
- ছবি আপলোড — Cloudinary কী দিলে ক্লাউডে, না দিলে লোকালে
- অর্ডার ইমেইল — Resend কী দিলে যাবে; না দিলে বাটনটা "Email is not configured" বলবে (ক্র্যাশ করবে না)

## ৪) Vercel-এ ডিপ্লয় (ধাপে ধাপে)

1. **GitHub-এ কোড তোলা** — `push.bat` ডাবল-ক্লিক (দেখুন `PUSH-TO-GITHUB-BN.md`)
2. [vercel.com](https://vercel.com) → **Add New… → Project** → আপনার রিপো **Import**
3. Framework: **Next.js** (নিজেই ধরে নেবে) — Build: `npm run build`
4. **Environment Variables** এ এক এক করে বসান (নিচের লিস্ট), তারপর **Deploy**
5. ডিপ্লয় শেষে ডোমেইন দিন: **Settings → Domains**
6. এখানে `NEXT_PUBLIC_SITE_URL` আর `BETTER_AUTH_URL` = `https://আপনার-ডোমেইন`
7. Google লগইন ব্যবহার করলে Google Console-এ callback যোগ করুন:
   `https://আপনার-ডোমেইন/api/auth/callback/google`
8. Atlas-এ **Network Access → Add IP → 0.0.0.0/0** (Vercel-এর IP নির্দিষ্ট নয়)
9. শেষ ধাপ: `npm run seed` লোকাল থেকে Atlas-এ চালান (একবারই), অথবা ডিপ্লয়ের পর অ্যাডমিন থেকে
   প্রোডাক্ট/কনটেন্ট ঢুকিয়ে নিন — মডেল দুই-ই চলবে।

### Vercel-এ যেগুলো বসাতে হবে
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=LABONNO
MONGODB_URI=mongodb+srv://...        MONGODB_DB=labonno
BETTER_AUTH_SECRET=...               BETTER_AUTH_URL=https://yourdomain.com
OWNER_EMAILS=marufsalauddioffical@gmail.com
CLOUDINARY_CLOUD_NAME=  CLOUDINARY_API_KEY=  CLOUDINARY_API_SECRET=  CLOUDINARY_UPLOAD_FOLDER=labonno
RESEND_API_KEY=  EMAIL_FROM=  EMAIL_REPLY_TO=
BKASH_*  NAGAD_*  SSLCOMMERZ_*
GOOGLE_CLIENT_ID=  GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GA_ID=  NEXT_PUBLIC_META_PIXEL_ID=
```
> পরে কী যোগ করলেও **Settings → Environment Variables → Edit → Save → Redeploy** — কোড ছুঁতে হবে না।

## ৫) নিরাপত্তা
- `.env.local` কখনো GitHub-এ যাবে না (`.gitignore`-এ আছে), তাই `push.bat` চালালেও ফাঁস হবে না।
- **কেউ `.env.local` দেখতে পেলে** ওই কী বাতিল করুন:
  - Atlas পাসওয়ার্ড → Database Access → Edit Password
  - `BETTER_AUTH_SECRET` → `npm run setup -- --force` (সব সেশন বাতিল হবে, আবার লগইন)
  - Cloudinary → API Keys → Generate new secret · Resend → Roll key
- Vercel-এ কী দেওয়ার পর লোকাল ফাইলে রাখার দরকার নেই — তবে রাখলে `.env.local`-ই একমাত্র জায়গা।

## ৬) ডিপ্লয়ের পর যা একবার দেখে নিন
- [ ] `/` হোমপেজে সেকশন আসছে
- [ ] `/shop` ফিল্টার + ক্যাটাগরি কাজ করছে
- [ ] `/admin/login` আপনার ইমেইলে ঢুকছে (auto super admin)
- [ ] অ্যাডমিন → Everything → Connected services: যেগুলো দিয়েছেন সব **ON**
- [ ] ছবি আপলোড → Cloudinary URL আসছে
- [ ] অর্ডার দিয়ে ইমেইল গেল (Resend দিলে)
- [ ] `npm run check:env` এ `Needs attention` খালি
