import { MongoClient, type Db, type Collection, type Document } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "labonno";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and provide a MongoDB connection string.");
}

/**
 * Next.js dev mode hot-reloads modules, so the client is cached on globalThis
 * to avoid exhausting the Atlas connection pool.
 */
const globalForMongo = globalThis as unknown as {
  _labonnoMongoClient?: MongoClient;
  _labonnoIndexesReady?: Promise<void>;
};

export const mongoClient: MongoClient =
  globalForMongo._labonnoMongoClient ??
  (globalForMongo._labonnoMongoClient = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 8000,
    retryWrites: true,
  }));

export function getDb(): Db {
  return mongoClient.db(dbName);
}

export function col<T extends Document = Document>(name: string): Collection<T> {
  return getDb().collection<T>(name);
}


/**
 * Creates every index the application relies on. Safe to call repeatedly — it is
 * memoised in dev and executed once during the seed step in production.
 */
export async function ensureIndexes(): Promise<void> {
  if (globalForMongo._labonnoIndexesReady) return globalForMongo._labonnoIndexesReady;

  globalForMongo._labonnoIndexesReady = (async () => {
    const db = getDb();
    await Promise.all([
      db.collection("user").createIndex({ email: 1 }, { unique: true }),
      db.collection("session").createIndex({ userId: 1 }),
      db.collection("session").createIndex({ token: 1 }, { unique: true }),
      db.collection("account").createIndex({ userId: 1 }),
      db.collection("products").createIndex({ slug: 1 }, { unique: true }),
      db.collection("products").createIndex({ sku: 1 }, { unique: true }),
      db.collection("products").createIndex({ category: 1, status: 1 }),
      db.collection("products").createIndex({ collections: 1 }),
      db.collection("products").createIndex({ featured: 1, bestSeller: 1, newArrival: 1 }),
      db.collection("products").createIndex({ name: "text", shortDescription: "text", tags: "text" }),
      db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
      db.collection("collections").createIndex({ slug: 1 }, { unique: true }),
      db.collection("orders").createIndex({ orderNumber: 1 }, { unique: true }),
      db.collection("orders").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("orders").createIndex({ "customer.phone": 1 }),
      db.collection("orders").createIndex({ status: 1, createdAt: -1 }),
      db.collection("reviews").createIndex({ productId: 1, status: 1 }),
      db.collection("coupons").createIndex({ code: 1 }, { unique: true }),
      db.collection("banners").createIndex({ placement: 1, order: 1 }),
      db.collection("homepage_sections").createIndex({ key: 1 }, { unique: true }),
      db.collection("homepage_sections").createIndex({ order: 1 }),
      db.collection("content_pages").createIndex({ slug: 1 }, { unique: true }),
      db.collection("wishlists").createIndex({ userId: 1 }, { unique: true }),
      db.collection("addresses").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
      db.collection("inventory_logs").createIndex({ productId: 1, createdAt: -1 }),
      db.collection("media").createIndex({ createdAt: -1 }),
    ]);
  })();

  return globalForMongo._labonnoIndexesReady;
}
