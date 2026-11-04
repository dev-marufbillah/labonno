/**
 * npm run check:env
 *
 * Prints which services are switched on, which will work in a reduced mode and which
 * are off — without ever showing a secret. Run it after adding keys to .env.local
 * (or in the Vercel dashboard) to know what will actually happen on the site.
 */
import "./load-env";

async function main() {
  const { integrations } = await import("../lib/config/integrations");

  const list = integrations();
  const icon = (state: string) => (state === "on" ? "✔" : state === "manual" ? "•" : "✖");
  const label = (state: string) => (state === "on" ? "ON" : state === "manual" ? "FALLBACK" : "OFF");

  console.log("\nLABONNO — environment check\n═══════════════════════════\n");
  for (const item of list) {
    console.log(`  ${icon(item.state)} ${item.name.padEnd(34)} ${label(item.state)}`);
    console.log(`      ${item.detail}`);
    if (item.state !== "on") console.log(`      needs: ${item.env}`);
  }

  const on = list.filter((item) => item.state === "on").length;
  const missing = list.filter((item) => item.state === "off");

  console.log(`\n${on} of ${list.length} services connected.`);

  const problems: string[] = [];
  if (!process.env.MONGODB_URI) problems.push("MONGODB_URI is empty — nothing will load. Run: npm run setup");
  if (!process.env.BETTER_AUTH_SECRET) problems.push("BETTER_AUTH_SECRET is empty — logins cannot be signed.");
  if (process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length < 24) {
    problems.push("BETTER_AUTH_SECRET looks short — regenerate it (npm run setup gives a fresh one).");
  }
  if (process.env.NODE_ENV === "production" && String(process.env.NEXT_PUBLIC_SITE_URL ?? "").includes("localhost")) {
    problems.push("NEXT_PUBLIC_SITE_URL still points at localhost — set your real domain before deploying.");
  }

  if (problems.length) {
    console.log("\nNeeds attention:");
    for (const problem of problems) console.log(`  ! ${problem}`);
  }
  if (missing.length) {
    console.log("\nOff (the site still works, just without these):");
    for (const item of missing) console.log(`  - ${item.name} → ${item.env}`);
  }
  console.log("\nEvery key can be added later without touching code: paste it in .env.local,");
  console.log("restart the dev server (or redeploy) and the feature switches itself on.\n");
}

main().catch((error) => {
  console.error("check:env failed:", error);
  process.exitCode = 1;
});
