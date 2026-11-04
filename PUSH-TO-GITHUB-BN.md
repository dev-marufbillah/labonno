# GitHub-এ কোড তোলা — এক ক্লিকে (`push.bat`)

> **একবার সেটআপ, তারপর যতবার চান ডাবল-ক্লিক।** কোনো কমান্ড মনে রাখতে হবে না।

---

## ধাপ ১ — GitHub-এ খালি রিপো বানান (একবারই)
1. [github.com](https://github.com) এ লগইন করুন
2. উপরে ডানদিকে **+** → **New repository**
3. Repository name: `labonno`
4. **Public/Private** যা চান (Private ভালো)
5. ⚠️ **"Add a README" / "Add .gitignore" — কিছুই টিক দেবেন না** (খালি রাখুন)
6. **Create repository** → যে লিংকটা দেখাবে সেটা কপি করুন:
   `https://github.com/আপনার-নাম/labonno.git`

## ধাপ ২ — দুটো ফাইল প্রজেক্টের রুটে রাখুন
`push.bat` আর `push.sh` — যেখানে `package.json` আছে সেখানেই।

## ধাপ ৩ — ডাবল-ক্লিক করুন `push.bat`
- প্রথমবার জিজ্ঞেস করবে: **Link:** → কপি করা লিংক পেস্ট → Enter
- এরপর নিজে নিজেই: repo তৈরি → সব ফাইল যোগ → কমিট → push
- শেষে `[OK] Hoye gechhe!` দেখাবে, আর GitHub-এ আপনার কোড থাকবে

**টোকেন (password) চাইলে:** GitHub পাসওয়ার্ড কাজ করে না।
GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
→ **Generate new token (classic)** → Expiration দিন → **scope: `repo`** টিক → **Generate**
→ টোকেনটা কপি করে পাস্ট করুন (একবার দেখায়, পরে আর দেখা যায় না — কোথাও লিখে রাখুন)।

এরপর যতবার কোড বদলাবেন: **`push.bat` ডাবল-ক্লিক** — ব্যস।

---

## কী কী কখনো GitHub-এ যাবে না
`.gitignore` আগেই বসানো আছে, তাই এগুলো push হবে না:
`node_modules`, `.next`, **`.env.local`** (পাসওয়ার্ড/কি), `.mongo-data`, `*.log`, `public/uploads/*`
> একই কারণে `.env.local`-এ থাকা MongoDB/Cloudinary/Resend কী কখনো ফাঁস হবে না।

## Windows-এ ডাবল-ক্লিক কাজ না করলে
- `push.bat`-এ ডান-ক্লিক → **Run with…** নয়, বরং: PowerShell খুলে প্রজেক্ট ফোল্ডারে গিয়ে `.\push.bat`
- অথবা Git Bash খুলে: `bash push.sh`
- "Windows protected your PC" এলে **More info → Run anyway**

## সমস্যা হলে
| যা দেখছেন | সমাধান |
|---|---|
| `Authentication failed` | পাসওয়ার্ডের বদলে **টোকেন** দিন (উপরের ধাপ) |
| `remote origin already exists` | `push.bat` নিজেই সামলায়; না হলে `git remote set-url origin <লিংক>` |
| `src refspec main does not match any` | কমিট হয়নি — ফোল্ডারে `package.json` আছে কি না দেখুন, আবার চালান |
| `nothing to commit` | ঠিক আছে — শুধু push হবে |
| `rejected (fetch first)` | ইন্টারনেটে রিপোতে আগের ফাইল আছে: `git pull --rebase origin main` → আবার `push.bat` |
| `fatal: not a git repository` | `.git` ফোল্ডার ডিলিট হয়ে গেছে — `push.bat` আবার চালালেই নতুন করে বানাবে |

## বিকল্প: একদম কোড ছাড়া
[GitHub Desktop](https://desktop.github.com) ইনস্টল করে **Add local repository → labonno ফোল্ডার → Publish repository**
— এটাও এক ক্লিক, তবে প্রতিবার "Commit to main" → "Push origin" চাপতে হয়।

---

## প্রজেক্ট হিসেবে হোস্ট করতে চাইলে (পরে)
GitHub-এ কোড থাকা মানে সাইট লাইভ নয়। লাইভ করতে **Vercel**-এ অ্যাকাউন্ট খুলে
GitHub রিপো কানেক্ট করবেন — তারপর প্রতিবার `push.bat` চালালেই সাইট নিজে আপডেট হয়ে যাবে।
