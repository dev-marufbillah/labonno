/**
 * Create or repair the demo/staff accounts — without touching the catalogue.
 *
 *   npm run seed:users
 *
 * Use this when the site has products but nobody can sign in, or when a password is
 * forgotten or does not match. It never deletes products, orders or content; it makes
 * sure the three accounts exist, their password is the one from .env.local (or the
 * documented default), and they carry the right role.
 */
import "./load-env";
import { mongoClient } from "../lib/db/mongo";
import { createAuth } from "../lib/auth/core";
import { ensureSeedAccounts, seedAccountSpecs } from "./lib/accounts";

async function main() {
  const db = mongoClient.db(process.env.MONGODB_DB || "labonno");
  const auth = createAuth({ withNextCookies: false, disableRateLimit: true });

  const specs = seedAccountSpecs();
  const results = await ensureSeedAccounts(db, auth, specs);

  console.log("\nAccounts ready\n──────────────");
  for (const result of results) {
    const password = specs.find((spec) => spec.email.toLowerCase() === result.email)?.password ?? "—";
    const note = result.created ? "(created)" : result.passwordReset ? "(password reset)" : "(already existed)";
    console.log(`  ${result.role.padEnd(12)} ${result.email.padEnd(24)} ${password}   ${note}`);
  }

  // Remove orphan credential rows left behind by an interrupted run: they are the
  // rows that make "sign in" fail with a message that mentions nothing useful.
  const userIds = (await db.collection("user").find({}).project({ _id: 1 }).toArray()).flatMap((doc) => [doc._id, String(doc._id)]);
  const orphanFilter = { userId: { $nin: userIds } };
  const orphans = await db.collection("account").countDocuments(orphanFilter);
  if (orphans > 0) {
    await db.collection("account").deleteMany(orphanFilter);
    await db.collection("session").deleteMany(orphanFilter);
    console.log(`Cleaned ${orphans} orphan credential row(s) from an earlier failed run.`);
  }

  const total = await db.collection("user").countDocuments();
  const admins = await db.collection("user").countDocuments({ role: { $in: ["admin", "super_admin"] } });
  console.log(`\nDatabase now holds ${total} account(s), ${admins} with studio access.`);
  console.log("Sign in at /admin/login (studio) or /login (customer).\n");
}

main()
  .catch((error) => {
    console.error("\n✖ Could not prepare the accounts:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close();
  });
