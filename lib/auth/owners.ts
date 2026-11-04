import { col } from "@/lib/db/mongo";
import { DEFAULT_OWNER_EMAILS, normaliseEmail, staticOwnerEmails } from "@/lib/auth/owner-emails";

export { DEFAULT_OWNER_EMAILS, normaliseEmail, staticOwnerEmails };

/**
 * The people who own the studio.
 *
 * An owner email is enough to get into /admin — no role juggling, no database
 * editing by hand. The list comes from three places, all additive:
 *
 *   1. the compiled-in default (the founder's address),
 *   2. `OWNER_EMAILS` in `.env.local` (comma separated),
 *   3. the `access.ownerEmails` array inside the site settings document, which the
 *      panel can edit.
 *
 * Sign-up with an owner address is created straight as super admin, and an account
 * that already exists as a customer is promoted the next time it opens the panel.
 */
/** Every owner address, including the ones stored in the site settings. */
export async function ownerEmails(): Promise<string[]> {
  const emails = new Set(staticOwnerEmails());
  try {
    const doc = (await col("site_settings").findOne({ _id: "site" } as never)) as
      | { access?: { ownerEmails?: string[] } }
      | null;
    for (const email of doc?.access?.ownerEmails ?? []) emails.add(normaliseEmail(String(email)));
  } catch {
    /* database not reachable yet — the env list still applies */
  }
  return [...emails];
}

export async function isOwnerEmail(email?: string | null): Promise<boolean> {
  if (!email) return false;
  return (await ownerEmails()).includes(normaliseEmail(email));
}
