/**
 * Owner addresses — pure helpers, safe to import from client components.
 *
 * An owner email is enough to get into /admin. The list comes from three places,
 * all additive:
 *
 *   1. the compiled-in default (the founder's address),
 *   2. `OWNER_EMAILS` in the environment (comma separated),
 *   3. the `access.ownerEmails` array inside the site settings document, which the
 *      panel can edit.
 *
 * This module deliberately touches nothing but `process.env`, so it can be bundled
 * for the browser. The database-aware helpers live in `lib/auth/owners.ts`.
 */
export const DEFAULT_OWNER_EMAILS = ["marufsalauddioffical@gmail.com"];

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseOwnerEmailList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,\s;]+/)
    .map(normaliseEmail)
    .filter((value) => value.includes("@"));
}

/** Env + compiled defaults only — no database access. */
export function staticOwnerEmails(): string[] {
  return [...new Set([...DEFAULT_OWNER_EMAILS, ...parseOwnerEmailList(process.env.OWNER_EMAILS)])];
}
