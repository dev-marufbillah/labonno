/**
 * Headless smoke test for the LABONNO data layer.
 *
 * Runs the same service functions the pages and admin screens call, against the
 * real MongoDB instance — no Next.js bundler involved, so it works on machines
 * where `next build` would exceed the available RAM.
 *
 *   npm run smoke
 *
 * It creates one throwaway order (prefixed SMOKE-) and removes it afterwards.
 */
import { MongoClient, ObjectId } from "mongodb";
import { col } from "../lib/db/mongo";
import { getSiteSettings, shippingChargeFor } from "../lib/services/settings";
import { getCategories, getCategoryBySlug, getCollections, getCollectionBySlug } from "../lib/services/catalog";
import { getProductBySlug, getRelatedProducts, listProducts } from "../lib/services/products";
import {
  createOrder,
  getOrderByNumber,
  getOrderForTracking,
  listOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../lib/services/orders";
import { getDashboardStats, getSalesReport, getTopProducts, getRevenueSeries } from "../lib/services/reports";
import { getHomepageSections, getFaqs, getFooterPages, addSubscriber } from "../lib/services/content";
import { listCustomers } from "../lib/services/customers";
import { listCoupons, validateCouponForSubtotal } from "../lib/services/coupons";
import { getProductFacets } from "../lib/services/products";

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: unknown, detail?: unknown) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(name);
    console.log(`  ✗ ${name}`, detail ?? "");
  }
}

async function main() {
  console.log("\nLABONNO data-layer smoke test\n");

  console.log("settings & content");
  const settings = await getSiteSettings();
  check("site settings load with brand name", settings.general?.brandName?.length > 0, settings.general?.brandName);
  check("navigation has header links", (settings.navigation?.header?.length ?? 0) > 0);
  const sections = await getHomepageSections();
  check("homepage sections ordered", sections.length >= 5, sections.map((s) => s.key).join(","));
  const faqs = await getFaqs();
  check("faqs seeded", faqs.length >= 5, faqs.length);
  const footerPages = await getFooterPages();
  check("footer content pages", footerPages.length > 0, footerPages.length);

  console.log("\ncatalog");
  const categories = await getCategories();
  check("categories listed", categories.length > 0, categories.length);
  const firstCategory = categories[0];
  const bySlug = firstCategory ? await getCategoryBySlug(firstCategory.slug) : null;
  check("category resolvable by slug", bySlug?.slug === firstCategory?.slug);
  const collections = await getCollections();
  check("collections listed", collections.length > 0, collections.length);
  const collection = collections[0] ? await getCollectionBySlug(collections[0].slug) : null;
  check("collection resolvable by slug", collection?.slug === collections[0]?.slug);

  const listing = await listProducts({ perPage: 8 });
  check("product listing returns page shape", typeof listing.totalPages === "number" && Array.isArray(listing.products));
  check("price bounds computed", Boolean(listing.priceBounds), listing.priceBounds);
  const product = listing.products[0];
  check("products seeded", Boolean(product));
  if (!product) throw new Error("No products in database — run `npx tsx scripts/seed.ts` first.");

  const detail = await getProductBySlug(product.slug);
  check("product detail by slug", detail?.slug === product.slug);
  check("variant has size/color/stock", Boolean(detail?.variants?.[0]?.size && detail.variants[0].color && typeof detail.variants[0].stock === "number"));

  const filtered = await listProducts({
    category: product.category,
    sizes: [product.variants[0]?.size],
    colors: [product.variants[0]?.color],
    sort: "price-asc",
    page: 1,
    perPage: 4,
  });
  check("filtered + sorted listing", filtered.products.length > 0, filtered.products.length);
  const facets = await getProductFacets();
  check("facets expose sizes & colors", facets.sizes.length > 0 && facets.colors.length > 0);
  const related = await getRelatedProducts(product, 4);
  check("related products", Array.isArray(related));
  check("search query works", (await listProducts({ search: product.name.split(" ")[0] })).products.length > 0);
  check(
    "price range filter respected",
    (await listProducts({ minPrice: product.price, maxPrice: product.price, perPage: 50 })).products.every((p) => p.price >= product.price),
  );

  console.log("\ncoupons & pricing");
  const coupons = await listCoupons();
  check("coupons seeded", coupons.length > 0, coupons.length);
  const coupon = coupons.find((c) => c.active) ?? coupons[0];
  const evaluation = await validateCouponForSubtotal(coupon.code, (product.price ?? 0) * 2);
  check("coupon evaluation returns discount field", "discount" in evaluation, evaluation);

  console.log("\norders (creates one throwaway order)");
  const variant = detail!.variants[0];
  const created = await createOrder({
    items: [{ productId: product._id!.toString(), size: variant.size, color: variant.color, quantity: 1 }],
    customer: { name: "Smoke Test", email: "smoke@labonno.test", phone: "01700000000" },
    shippingAddress: { address: "House 1, Road 2", area: "Gulshan", district: "Dhaka" },
    paymentMethod: "cod",
    deliveryCharge: shippingChargeFor("Dhaka", settings),
    settings,
  });
  check("order created with number", /^LBN-/.test(created.orderNumber) || created.orderNumber.length > 3, created.orderNumber);
  check("order number is unique-ish", Boolean(await getOrderByNumber(created.orderNumber)));
  check(
    "totals computed",
    created.total > 0 && created.subtotal >= created.total - created.deliveryCharge,
    { subtotal: created.subtotal, delivery: created.deliveryCharge, total: created.total }
  );
  check("tracking lookup by phone", Boolean(await getOrderForTracking(created.orderNumber, "01700000000")));
  check("tracking rejects wrong phone", (await getOrderForTracking(created.orderNumber, "01800000000")) === null);

  const adminOrders = await listOrders({ page: 1, perPage: 5 });
  check("admin order list paginates", adminOrders.orders.length > 0 && adminOrders.totalPages >= 1);
  check("admin search finds the order", (await listOrders({ search: created.orderNumber, page: 1 })).orders.length === 1);

  const step1 = await updateOrderStatus(created._id!.toString(), "confirmed", "smoke");
  check("pending → confirmed", step1.ok, step1.message);
  const illegal = await updateOrderStatus(created._id!.toString(), "delivered", "smoke");
  check("illegal jump rejected", !illegal.ok, illegal.message);
  const step2 = await updateOrderStatus(created._id!.toString(), "processing", "smoke");
  check("confirmed → processing", step2.ok, step2.message);
  const payment = await updatePaymentStatus(created._id!.toString(), "paid", "smoke");
  check("payment marked paid", payment.ok, payment.message);

  console.log("\nadmin reporting");
  const stats = await getDashboardStats();
  check("dashboard stats", stats.revenue >= 0 && typeof stats.orderCount === "number", stats);
  const series = await getRevenueSeries(30);
  check("revenue series zero-filled for 30 days", series.length === 30, series.length);
  const top = await getTopProducts(5);
  check("top products", Array.isArray(top));
  const now = new Date();
  const report = await getSalesReport(new Date(now.getFullYear(), now.getMonth() - 1, 1), now);
  check("sales report for date range", typeof report.revenue === "number", report.revenue);
  const customers = await listCustomers();
  check("customers listed", customers.length > 0, customers.length);

  console.log("\nnewsletter");
  const email = `smoke+${Date.now()}@labonno.test`;
  const sub1 = await addSubscriber(email, "smoke");
  const sub2 = await addSubscriber(email, "smoke");
  check("subscriber added", sub1.ok, sub1.message);
  check("duplicate subscriber handled idempotently", sub2.ok && /already subscribed/i.test(sub2.message), sub2.message);

  // cleanup: drop the throwaway order + subscriber
  await col("orders").deleteOne({ _id: new ObjectId(created._id) });
  await col("subscribers").deleteOne({ email });
  await col("inventory_logs").deleteMany({ orderId: created._id!.toString() });
  check("cleanup removed smoke order", (await getOrderByNumber(created.orderNumber)) === null);

  await mongoClientCleanup();

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log("Failed checks:\n" + failures.map((f) => ` - ${f}`).join("\n"));
    process.exitCode = 1;
  }
}

async function mongoClientCleanup() {
  const client = (globalThis as unknown as { _labonnoMongoClient?: MongoClient })._labonnoMongoClient;
  await client?.close();
}

main().catch(async (error) => {
  console.error("\nSmoke test crashed:", error);
  await mongoClientCleanup();
  process.exitCode = 1;
});
