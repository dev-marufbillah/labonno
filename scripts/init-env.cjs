#!/usr/bin/env node
/**
 * One-command environment bootstrap.
 *
 *   npm run setup
 *
 * Copies .env.example to .env.local (never overwriting an existing file) and fills
 * BETTER_AUTH_SECRET with a freshly generated 32-byte key, so the only value left
 * to edit by hand is the MongoDB connection string.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const example = path.join(root, ".env.example");
const target = path.join(root, ".env.local");

if (!fs.existsSync(example)) {
  console.error("✖ .env.example not found — are you inside the project folder?");
  process.exit(1);
}

const force = process.argv.includes("--force");

if (fs.existsSync(target) && force) {
  // npm run setup -- --force : keep every value, rotate only the auth secret.
  const existing = fs.readFileSync(target, "utf8");
  const secret = crypto.randomBytes(32).toString("base64");
  const updated = /^BETTER_AUTH_SECRET=.*$/m.test(existing)
    ? existing.replace(/^BETTER_AUTH_SECRET=.*$/m, `BETTER_AUTH_SECRET=${secret}`)
    : `${existing.trimEnd()}\nBETTER_AUTH_SECRET=${secret}\n`;
  fs.writeFileSync(target, updated);
  console.log("✔ Rotated BETTER_AUTH_SECRET in .env.local (every other value kept).");
  console.log("  All existing sessions are now invalid — sign in again.");
} else if (fs.existsSync(target)) {
  console.log("• .env.local already exists — leaving it untouched.");
  console.log("  Rotate only the auth secret:  npm run setup -- --force");
  console.log("  Fresh copy of everything:     delete .env.local, then npm run setup");
} else {
  const content = fs
    .readFileSync(example, "utf8")
    .replace(/^BETTER_AUTH_SECRET=.*$/m, `BETTER_AUTH_SECRET=${crypto.randomBytes(32).toString("base64")}`);
  fs.writeFileSync(target, content);
  console.log("✔ Created .env.local with a freshly generated BETTER_AUTH_SECRET");
}

console.log(`
Next steps
──────────
1. Open .env.local and set your database connection:

     MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     MONGODB_DB=labonno

   No MongoDB yet? Create a free cluster at https://www.mongodb.com/cloud/atlas/register
   (docs/SETUP-GUIDE-BN.md §2.1 walks through it in Bangla).

2. Load the demo catalogue and accounts:   npm run seed
3. Start the site:                         npm run dev
4. Open http://localhost:3000  ·  admin at /admin/login
5. See which services are live:            npm run check:env
`);
