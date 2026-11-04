/**
 * One command that answers "why can't I sign in?".
 *
 *   npm run doctor
 *
 * It checks, in order: the environment file, the database connection, whether the
 * seeded accounts exist in the same database the app uses, whether their password
 * matches the one in .env.local, and finally tries a real sign-in request against the
 * running dev server. The last lines tell you exactly what to do next.
 */
import "./load-env";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { mongoClient } from "../lib/db/mongo";
import { seedAccountSpecs } from "./lib/accounts";

const problems: string[] = [];
const fixes: string[] = [];

function ok(message: string) {
  console.log(`  \u001b[32m✔\u001b[0m ${message}`);
}
function bad(message: string, fix?: string) {
  console.log(`  \u001b[31m✖\u001b[0m ${message}`);
  problems.push(message);
  if (fix) fixes.push(fix);
}
function info(label: string, value: string) {
  console.log(`    ${label.padEnd(22)} ${value}`);
}
function mask(value: string) {
  if (!value) return "—";
  return value.replace(/\/\/([^:]+):([^@]+)@/, (_m, user) => `//${user}:••••@`);
}

async function main() {
  console.log("\nLABONNO doctor\n══════════════");

  // ---------------------------------------------------------------- environment
  console.log("\n1. Environment");
  const hasEnvFile = existsSync(join(process.cwd(), ".env.local"));
  hasEnvFile ? ok(".env.local found") : bad(".env.local not found", "npm run setup");
  if (!hasEnvFile && !process.env.MONGODB_URI) {
    console.log("\nNothing else can be checked without a database URL. Run `npm run setup` first.\n");
    return;
  }

  const uri = process.env.MONGODB_URI ?? "";
  const dbName = process.env.MONGODB_DB || "labonno";
  uri
    ? ok(`MONGODB_URI set → ${mask(uri).slice(0, 90)}`)
    : bad("MONGODB_URI missing", "Open .env.local and paste the Atlas connection string");
  info("database name", dbName);
  process.env.BETTER_AUTH_SECRET
    ? ok("BETTER_AUTH_SECRET set")
    : bad("BETTER_AUTH_SECRET missing", "npm run setup generates one");
  const baseUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  info("auth base URL", baseUrl);

  // ----------------------------------------------------------------- database
  console.log("\n2. Database");
  let db;
  try {
    const started = Date.now();
    await mongoClient.connect();
    await mongoClient.db(dbName).command({ ping: 1 });
    db = mongoClient.db(dbName);
    ok(`connected in ${Date.now() - started} ms (db "${dbName}")`);
  } catch (error) {
    bad(`cannot connect: ${(error as Error).message}`, "Check MONGODB_URI and, on Atlas, allow your IP (0.0.0.0/0) under Network Access");
    return report();
  }

  const counts = {
    users: await db.collection("user").countDocuments(),
    credentials: await db.collection("account").countDocuments({ providerId: "credential" }),
    products: await db.collection("products").countDocuments(),
    orders: await db.collection("orders").countDocuments(),
  };
  info("users / credentials", `${counts.users} / ${counts.credentials}`);
  info("products / orders", `${counts.products} / ${counts.orders}`);
  if (counts.users === 0) bad("no accounts in this database", "npm run seed:users");

  const content = {
    sections: await db.collection("homepage_sections").countDocuments(),
    categories: await db.collection("categories").countDocuments(),
    banners: await db.collection("banners").countDocuments(),
    coupons: await db.collection("coupons").countDocuments(),
    pages: await db.collection("pages").countDocuments(),
  };
  info("homepage sections", String(content.sections));
  info("categories / banners", `${content.categories} / ${content.banners}`);
  info("coupons / pages", `${content.coupons} / ${content.pages}`);
  if (content.sections === 0) bad("homepage sections are empty — the storefront would look blank", "npm run seed");
  if (content.categories === 0) bad("no categories", "npm run seed");

  // ----------------------------------------------------------------- accounts
  console.log("\n3. Seeded accounts");
  const { verifyPassword } = await import("better-auth/crypto");
  const specs = seedAccountSpecs();
  let usable = 0;

  for (const spec of specs) {
    const email = spec.email.toLowerCase();
    const user = await db.collection("user").findOne({ email });
    if (!user) {
      bad(`${spec.email} does not exist`, "npm run seed:users");
      continue;
    }
    const credential = await db.collection("account").findOne({
      userId: { $in: [user._id, String(user._id)] },
      providerId: "credential",
    });
    if (!credential?.password) {
      bad(`${spec.email} exists but has no password row`, "npm run seed:users");
      continue;
    }
    let matches = false;
    try {
      matches = await verifyPassword({ hash: credential.password as string, password: spec.password });
    } catch {
      matches = false;
    }
    if (matches) {
      usable += 1;
      ok(`${spec.email} — role ${user.role ?? "?"}, password "${spec.password}" ✔`);
    } else {
      bad(
        `${spec.email} — password in .env.local ("${spec.password}") does NOT match the stored hash (role ${user.role ?? "?"})`,
        "npm run seed:users   (it resets the password to the value above)"
      );
    }
  }

  // ------------------------------------------------------- real HTTP sign-in
  console.log(`\n4. Live sign-in request (${baseUrl})`);
  const admin = specs[0];
  try {
    const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: baseUrl },
      body: JSON.stringify({ email: admin.email, password: admin.password }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await response.json().catch(() => ({}))) as { user?: { role?: string }; code?: string; message?: string };
    if (response.ok && body.user) {
      ok(`sign-in returned ${response.status} — role "${body.user.role}"`);
      info("note", "If the browser still shows 'Wrong email or password', the dev server is running old code: stop it with Ctrl+C and start `npm run dev` again.");
    } else {
      bad(`sign-in returned ${response.status} ${body.code ?? body.message ?? ""}`.trim());
    }
  } catch {
    info("skipped", `dev server not reachable at ${baseUrl} — start it with \`npm run dev\` and run the doctor again`);
  }

  report();
}

function report() {
  console.log("\nVerdict");
  console.log("───────");
  if (problems.length === 0) {
    console.log("  Everything checks out — sign in at /admin/login with the credentials printed above.\n");
  } else {
    for (const problem of problems) console.log(`  • ${problem}`);
    console.log("\nNext steps");
    console.log("──────────");
    [...new Set(fixes)].forEach((fix, index) => console.log(`  ${index + 1}. ${fix}`));
    console.log("");
  }
  process.exitCode = problems.length === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error("\ndoctor crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close().catch(() => {});
  });
