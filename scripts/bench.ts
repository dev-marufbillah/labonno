/**
 * Cold vs warm read timings — proof that the storefront cache is doing its job.
 *
 *   npm run bench
 *
 * "cold" clears the cache first, "warm" is the same call immediately after, which is
 * what every subsequent request pays instead of re-querying MongoDB.
 */
import "./load-env";
import { mongoClient } from "../lib/db/mongo";
import { invalidateSiteCache } from "../lib/services/cache";
import { getSiteSettings } from "../lib/services/settings";
import { getCategories, getCollections } from "../lib/services/catalog";
import { getHomepageSections, getFooterPages, getFaqs } from "../lib/services/content";
import { getHomepageProducts, listProducts } from "../lib/services/products";

type Case = { name: string; run: () => Promise<unknown> };

const cases: Case[] = [
  { name: "getSiteSettings", run: () => getSiteSettings() },
  { name: "getCategories", run: () => getCategories() },
  { name: "getCollections", run: () => getCollections() },
  { name: "getHomepageSections", run: () => getHomepageSections() },
  { name: "getFooterPages", run: () => getFooterPages() },
  { name: "getFaqs", run: () => getFaqs() },
  { name: "getHomepageProducts", run: () => getHomepageProducts() },
  { name: "listProducts (shop page 1)", run: () => listProducts({ page: 1, perPage: 12 }) },
];

async function time(run: () => Promise<unknown>) {
  const start = performance.now();
  await run();
  return performance.now() - start;
}

async function main() {
  // Warm the Mongo connection so the first case is not paying for a handshake.
  await getCategories();

  console.log("\nLABONNO read benchmark\n");
  console.log("  read                          cold      warm     saved");
  console.log("  ─────────────────────────────────────────────────────────");

  let coldTotal = 0;
  let warmTotal = 0;

  for (const testCase of cases) {
    invalidateSiteCache();
    const cold = await time(testCase.run);
    const warm = await time(testCase.run);
    coldTotal += cold;
    warmTotal += warm;
    const saved = cold > 0 ? Math.round((1 - warm / cold) * 100) : 0;
    console.log(
      `  ${testCase.name.padEnd(28)} ${cold.toFixed(1).padStart(6)}ms ${warm.toFixed(2).padStart(8)}ms ${String(saved + "%").padStart(8)}`
    );
  }

  console.log("  ─────────────────────────────────────────────────────────");
  console.log(
    `  ${"total".padEnd(28)} ${coldTotal.toFixed(1).padStart(6)}ms ${warmTotal.toFixed(2).padStart(8)}ms`
  );
  console.log("\n  Every storefront request after the first pays the warm column.\n");
}

main()
  .catch((error) => {
    console.error("Benchmark failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoClient.close();
  });
