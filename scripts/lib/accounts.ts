/**
 * Account bootstrap shared by `npm run seed` and `npm run seed:users`.
 *
 * Creating users through Better Auth's own API keeps the password hashing and the
 * `account` row exactly as the runtime expects, but the sign-up endpoint is rate
 * limited and the API returns errors instead of throwing loudly — which is how a
 * seeded database ended up with a full catalogue and **zero** accounts. This helper
 * disables the limiter for the script, verifies every account afterwards, and
 * repairs half-created users (a `user` row with no credential `account`).
 */
import type { Db } from "mongodb";

import type { createAuth } from "../../lib/auth/core";

type Auth = ReturnType<typeof createAuth>;

export interface SeedAccountSpec {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "customer";
  phone?: string;
}

/** Replaces the stored credential hash with a freshly hashed password. */
async function setPassword(db: Db, userId: unknown, email: string, password: string): Promise<void> {
  const { hashPassword } = await import("better-auth/crypto");
  const hash = await hashPassword(password);
  const account = db.collection("account");

  const updated = await account.updateOne(
    { userId, providerId: "credential" },
    { $set: { password: hash, updatedAt: new Date() } }
  );
  const matched =
    updated.matchedCount > 0 ||
    (await account.updateOne(
      { userId: String(userId), providerId: "credential" },
      { $set: { password: hash, updatedAt: new Date() } }
    )).matchedCount > 0;

  if (!matched) throw new Error(`Could not store a password for ${email} — no credential row.`);

  // Invalidate existing sessions so a stale cookie cannot keep someone signed in.
  await db.collection("session").deleteMany({ userId: { $in: [userId, String(userId)] } });
}

/** True when the stored hash matches the given password. */
async function passwordMatches(db: Db, userId: unknown, password: string): Promise<boolean> {
  const { verifyPassword } = await import("better-auth/crypto");
  const credential = await findCredential(db, userId);
  const hash = credential?.password as string | undefined;
  if (!hash) return false;
  try {
    return await verifyPassword({ hash, password });
  } catch {
    return false;
  }
}

export interface EnsuredAccount {
  email: string;
  role: string;
  created: boolean;
  passwordReset: boolean;
}

/**
 * Better Auth's Mongo adapter stores `account.userId` / `session.userId` as the same
 * type as `user._id` (an ObjectId here). Comparing a String() of the id against those
 * fields silently never matches, which is how a "repair" could delete a perfectly
 * good account — so both representations are tried.
 */
async function findCredential(db: Db, userId: unknown) {
  const account = db.collection("account");
  return (
    (await account.findOne({ userId, providerId: "credential" })) ??
    (await account.findOne({ userId: String(userId), providerId: "credential" }))
  );
}

/**
 * Writes the `user` + credential `account` rows by hand, the same shape Better Auth
 * creates — used when the auth API cannot be called (for example a local mongod that
 * has no replica set, so Better Auth's sign-up transaction is rejected).
 */
async function createAccountDirectly(db: Db, spec: SeedAccountSpec, email: string): Promise<void> {
  const { hashPassword } = await import("better-auth/crypto");
  const now = new Date();

  const inserted = await db.collection("user").insertOne({
    name: spec.name,
    email,
    emailVerified: true,
    role: spec.role,
    ...(spec.phone ? { phone: spec.phone } : {}),
    createdAt: now,
    updatedAt: now,
  });

  await db.collection("account").insertOne({
    userId: inserted.insertedId,
    providerId: "credential",
    accountId: String(inserted.insertedId),
    password: await hashPassword(spec.password),
    createdAt: now,
    updatedAt: now,
  });
}

export async function ensureSeedAccounts(db: Db, auth: Auth, specs: SeedAccountSpec[]): Promise<EnsuredAccount[]> {
  const results: EnsuredAccount[] = [];

  for (const spec of specs) {
    const email = spec.email.toLowerCase().trim();

    const existing = await db.collection("user").findOne({ email });
    if (existing) {
      const credential = await findCredential(db, existing._id);
      if (!credential) {
        // Half-created user: no password row, so it can never sign in. Rebuild it.
        const idMatch = { userId: { $in: [existing._id, String(existing._id)] } };
        await db.collection("account").deleteMany(idMatch);
        await db.collection("session").deleteMany(idMatch);
        await db.collection("user").deleteOne({ _id: existing._id });
      }
    }

    let user = await db.collection("user").findOne({ email });

    if (!user) {
      try {
        await auth.api.signUpEmail({
          body: { name: spec.name, email, password: spec.password, phone: spec.phone },
        });
      } catch (error) {
        const message = (error as Error).message ?? "";
        // A plain local mongod (the default Windows install) has no replica set, so
        // Better Auth's sign-up transaction is rejected with "Transaction numbers are
        // only allowed on a replica set member or mongos". Writing the same two rows
        // ourselves keeps seeding — and creating staff from the panel — working there.
        console.warn(`  • ${email}: auth API said "${message}" — writing the account directly.`);
        await createAccountDirectly(db, spec, email);
      }
      user = await db.collection("user").findOne({ email });
      if (!user) {
        throw new Error(`Account ${email} still missing after sign-up — nothing was written to the database.`);
      }
    }

    await db.collection("user").updateOne(
      { _id: user._id },
      { $set: { role: spec.role, emailVerified: true, ...(spec.phone ? { phone: spec.phone } : {}) } }
    );

    const credential = await findCredential(db, user._id);
    if (!credential) {
      throw new Error(`Account ${email} has no password record — run \`npm run seed:users\` to repair it.`);
    }

    // The account may exist with a different (or forgotten) password — the usual
    // reason a fresh clone cannot sign in with the documented credentials.
    let passwordReset = false;
    if (!(await passwordMatches(db, user._id, spec.password))) {
      await setPassword(db, user._id, email, spec.password);
      passwordReset = true;
    }

    results.push({ email, role: spec.role, created: !existing, passwordReset });
  }

  return results;
}

/** Owner addresses: compiled default + `OWNER_EMAILS`, kept in sync with lib/auth/owners.ts. */
function ownerEmailsFromEnv(): string[] {
  const raw = `marufsalauddioffical@gmail.com,${process.env.OWNER_EMAILS ?? ""}`;
  return [
    ...new Set(
      raw
        .split(/[,\s;]+/)
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.includes("@"))
    ),
  ];
}

/** The demo accounts plus every owner address, reading overrides from the environment. */
export function seedAccountSpecs(): SeedAccountSpec[] {
  const specs: SeedAccountSpec[] = [
    {
      name: "Maruf Salauddin",
      email: process.env.SEED_ADMIN_EMAIL || "marufsalauddioffical@gmail.com",
      password: process.env.SEED_ADMIN_PASSWORD || "Labonno@2026",
      role: "super_admin",
      phone: "01711000000",
    },
    {
      name: "Studio Admin",
      email: "admin@labonno.com",
      password: "Labonno@2026",
      role: "super_admin",
      phone: "01711000001",
    },
    {
      name: "Studio Manager",
      email: process.env.SEED_STAFF_EMAIL || "manager@labonno.com",
      password: process.env.SEED_STAFF_PASSWORD || "Labonno@2026",
      role: "admin",
      phone: "01711000002",
    },
    {
      name: "Nusrat Jahan",
      email: process.env.SEED_CUSTOMER_EMAIL || "customer@labonno.com",
      password: process.env.SEED_CUSTOMER_PASSWORD || "Labonno@2026",
      role: "customer",
      phone: "01812345678",
    },
  ];

  // One spec per address: if two entries share an email the stronger role wins.
  const unique = new Map<string, SeedAccountSpec>();
  for (const spec of specs) {
    const key = spec.email.toLowerCase();
    const current = unique.get(key);
    if (!current || (current.role !== "super_admin" && spec.role === "super_admin")) unique.set(key, spec);
  }
  specs.length = 0;
  specs.push(...unique.values());

  // Owners always end up with studio access, even if SEED_ADMIN_EMAIL points elsewhere.
  for (const email of ownerEmailsFromEnv()) {
    if (!specs.some((spec) => spec.email.toLowerCase() === email)) {
      specs.push({
        name: "Studio Owner",
        email,
        password: process.env.SEED_ADMIN_PASSWORD || "Labonno@2026",
        role: "super_admin",
      });
    }
  }

  return specs;
}
