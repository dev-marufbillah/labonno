/**
 * LABONNO seed script.
 * Usage: npm run seed
 * Creates indexes, CMS content, the catalogue, admin/customer accounts and a few
 * sample orders so every dashboard widget has real data to read.
 */
import "./load-env";
import { MongoClient, ObjectId } from "mongodb";
import type {
  BannerDoc,
  CategoryDoc,
  CollectionDoc,
  CouponDoc,
  HomepageSectionDoc,
  OrderDoc,
  PageDoc,
  ProductDoc,
  ReviewDoc,
  SiteSettingsDoc,
} from "../lib/db/types";


const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

const IMG = {
  hero1: "/images/hero-1.jpg",
  hero2: "/images/hero-2.jpg",
  dresses: "/images/cat-dresses.jpg",
  tops: "/images/cat-tops.jpg",
  bottoms: "/images/cat-bottoms.jpg",
  bags: "/images/cat-bags.jpg",
  featured: "/images/collection-featured.jpg",
  p1: "/images/product-1.jpg",
  p2: "/images/product-2.jpg",
  p3: "/images/product-3.jpg",
};

const categories: CategoryDoc[] = [
  {
    name: "Saree",
    slug: "saree",
    tagline: "Woven heirlooms",
    description:
      "Handwoven jamdani, silk and muslin sarees finished with hand-embroidered borders — each piece takes our weavers between three and six weeks.",
    image: IMG.hero2,
    order: 1,
    visible: true,
    showOnHome: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Three piece",
    slug: "three-piece",
    tagline: "Considered sets",
    description:
      "Unstitched and semi-stitched three-piece sets in handloom cotton, silk and organza — designed to be tailored to you.",
    image: IMG.p2,
    order: 2,
    visible: true,
    showOnHome: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Dresses",
    slug: "dresses",
    tagline: "Evening, edited",
    description: "Floor-length gowns, slip dresses and occasion pieces with hand-finished detailing.",
    image: IMG.dresses,
    order: 3,
    visible: true,
    showOnHome: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Tops",
    slug: "tops",
    tagline: "Quiet luxury",
    description: "Kurtas, kurtis and blouses in silk and handloom cotton, cut for everyday elegance.",
    image: IMG.tops,
    order: 4,
    visible: true,
    showOnHome: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    tagline: "Fluid tailoring",
    description: "Pleated palazzos, silk trousers and tailored culottes that move beautifully.",
    image: IMG.bottoms,
    order: 5,
    visible: true,
    showOnHome: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Bags & accessories",
    slug: "accessories",
    tagline: "The finishing note",
    description: "Leather bags, clutches, pearls and fine jewellery selected to complete a look.",
    image: IMG.bags,
    order: 6,
    visible: true,
    showOnHome: true,
    createdAt: now,
    updatedAt: now,
  },
];

const collections: CollectionDoc[] = [
  {
    name: "Timeless Elegance",
    slug: "timeless-elegance",
    tagline: "Pearls, ivory silk and quiet glamour",
    description:
      "Our signature collection: ivory and champagne pieces built around heirloom pearls and hand-finished silk. Designed to be worn for a decade, not aseason.",
    image: IMG.featured,
    order: 1,
    visible: true,
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Black Zari",
    slug: "black-zari",
    tagline: "Midnight silk, silver thread",
    description: "Black silk and organza with silver zari work — after-dark dressing for the city.",
    image: IMG.p3,
    order: 2,
    visible: true,
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Sage Fest",
    slug: "sage-fest",
    tagline: "Sage, gold and celebration",
    description: "Festive anarkalis and kurtas in sage, olive and antique gold for weddings and Eid.",
    image: IMG.hero1,
    order: 3,
    visible: true,
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Velvet Luxe",
    slug: "velvet-luxe",
    tagline: "Winter velvet, zardozi",
    description: "Deep velvet pieces with dense zardozi embroidery, made in very limited runs.",
    image: IMG.p1,
    order: 4,
    visible: true,
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
];

const sizesAll = ["XS", "S", "M", "L", "XL"];

function makeVariants(prefix: string, sizes: string[], colors: string[], baseStock = 7) {
  const rows: { sku: string; size: string; color: string; stock: number }[] = [];
  for (const color of colors) {
    for (const [i, size] of sizes.entries()) {
      rows.push({
        sku: `${prefix}-${color.slice(0, 3).toUpperCase()}-${size}`,
        size,
        color,
        stock: Math.max(0, baseStock - i - (color === colors[colors.length - 1] ? 2 : 0)),
      });
    }
  }
  return rows;
}

interface SeedProduct {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  category: string;
  collections: string[];
  images: string[];
  price: number;
  salePrice?: number | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  material: string;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  soldCount: number;
  rating: number;
  reviewCount: number;
}

const seedProducts: SeedProduct[] = [
  {
    name: "Zohra Emerald Lehenga",
    slug: "zohra-emerald-lehenga",
    sku: "LBN-ZO-EM",
    shortDescription: "Hand-embroidered emerald and antique gold bridal lehenga with dupatta.",
    description:
      "The Zohra is our most intricate piece to date. Four artisans spend six weeks setting antique gold dabka, sequin and pearl work across deep emerald silk, finishing each panel by hand. The lehenga is boned at the waist for structure, with a soft net dupatta edged in hand-rolled gold. Made to order in limited numbers.",
    category: "dresses",
    collections: ["sage-fest", "velvet-luxe"],
    images: [IMG.hero1, IMG.featured],
    price: 68500,
    salePrice: 58900,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Emerald", hex: "#0F4D3A" },
      { name: "Antique gold", hex: "#A9906B" },
    ],
    stock: 12,
    material: "Pure silk with hand zardozi embroidery",
    tags: ["bridal", "lehenga", "emerald", "hand embroidered"],
    featured: true,
    newArrival: true,
    bestSeller: true,
    soldCount: 24,
    rating: 5,
    reviewCount: 12,
  },
  {
    name: "Noor Champagne Saree",
    slug: "noor-champagne-saree",
    sku: "LBN-NO-CH",
    shortDescription: "Champagne gold jamdani saree with a hand-woven zari border.",
    description:
      "Woven on a pit loom over four weeks, the Noor pairs a whisper-light champagne ground with a traditional jamdani motif and a fine gold zari border. Comes with unstitched blouse fabric. Each piece carries slight variations — the signature of handloom.",
    category: "saree",
    collections: ["timeless-elegance"],
    images: [IMG.hero2, IMG.featured],
    price: 24500,
    salePrice: null,
    sizes: ["Free size"],
    colors: [{ name: "Champagne", hex: "#D9C7A7" }],
    stock: 8,
    material: "Handloom jamdani silk",
    tags: ["saree", "jamdani", "gold", "handloom"],
    featured: true,
    newArrival: true,
    bestSeller: true,
    soldCount: 31,
    rating: 5,
    reviewCount: 18,
  },
  {
    name: "Meher Burgundy Zardozi Kurta",
    slug: "meher-burgundy-zardozi-kurta",
    sku: "LBN-ME-BG",
    shortDescription: "Burgundy velvet kurta with dense gold zardozi, styled with black silk trousers.",
    description:
      "A winter signature: deep burgundy velvet with a hand-worked zardozi yoke, finished with a mandarin collar and silk-covered buttons. Includes matching black silk trousers. Dry clean only.",
    category: "tops",
    collections: ["velvet-luxe"],
    images: [IMG.p1, IMG.p3],
    price: 18500,
    salePrice: 15500,
    sizes: sizesAll,
    colors: [
      { name: "Burgundy", hex: "#5C1F2B" },
      { name: "Black", hex: "#1C1B18" },
    ],
    stock: 22,
    material: "Silk velvet with zardozi embroidery",
    tags: ["velvet", "kurta", "zardozi", "winter"],
    featured: true,
    newArrival: false,
    bestSeller: true,
    soldCount: 47,
    rating: 4.8,
    reviewCount: 23,
  },
  {
    name: "Roshni Blush Silk Slip Dress",
    slug: "roshni-blush-silk-slip-dress",
    sku: "LBN-RO-BL",
    shortDescription: "Blush pink mulberry silk slip dress with hand-finished straps.",
    description:
      "Cut on the bias in 19-momme mulberry silk, the Roshni falls just below the calf. Delicate hand embroidery traces the neckline; adjustable straps are finished by hand. Layer under a kurta or wear alone for evenings.",
    category: "dresses",
    collections: ["timeless-elegance"],
    images: [IMG.p2, IMG.dresses],
    price: 8900,
    salePrice: 6900,
    sizes: sizesAll,
    colors: [
      { name: "Blush", hex: "#E8C7C1" },
      { name: "Ivory", hex: "#F1E8DB" },
    ],
    stock: 30,
    material: "19-momme mulberry silk",
    tags: ["slip dress", "silk", "blush", "evening"],
    featured: true,
    newArrival: true,
    bestSeller: true,
    soldCount: 63,
    rating: 4.7,
    reviewCount: 31,
  },
  {
    name: "Ayan Black Zari Kurta Set",
    slug: "ayan-black-zari-kurta-set",
    sku: "LBN-AY-BK",
    shortDescription: "Black silk kurta set with silver zari embroidery and matching dupatta.",
    description:
      "The Black Zari collection's centrepiece. Black silk with fine silver zari worked across the placket and cuffs, paired with straight trousers and a feather-light organza dupatta. A considered alternative to colour for evening events.",
    category: "three-piece",
    collections: ["black-zari"],
    images: [IMG.p3, IMG.p1],
    price: 21500,
    salePrice: null,
    sizes: sizesAll,
    colors: [{ name: "Black", hex: "#161513" }],
    stock: 18,
    material: "Silk with silver zari",
    tags: ["black", "zari", "three piece", "evening"],
    featured: true,
    newArrival: false,
    bestSeller: true,
    soldCount: 39,
    rating: 4.9,
    reviewCount: 20,
  },
  {
    name: "Elara Ivory Evening Gown",
    slug: "elara-ivory-evening-gown",
    sku: "LBN-EL-IV",
    shortDescription: "Ivory floor-length gown with champagne thread embroidery.",
    description:
      "The Elara is cut from ivory silk crepe with a softly structured bodice and a floor-sweeping skirt. Champagne thread embroidery is worked along the bodice and hem by our studio team. Fully lined.",
    category: "dresses",
    collections: ["timeless-elegance"],
    images: [IMG.dresses, IMG.p2],
    price: 32500,
    salePrice: 28900,
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Ivory", hex: "#F3EDE3" },
      { name: "Champagne", hex: "#D9C7A7" },
    ],
    stock: 9,
    material: "Silk crepe with thread embroidery",
    tags: ["gown", "ivory", "evening", "wedding"],
    featured: true,
    newArrival: true,
    bestSeller: false,
    soldCount: 14,
    rating: 4.6,
    reviewCount: 8,
  },
  {
    name: "Sahar Mustard Silk Kurta",
    slug: "sahar-mustard-silk-kurta",
    sku: "LBN-SA-MU",
    shortDescription: "Mustard silk kurta with aari embroidery at the neckline.",
    description:
      "A studio favourite: mustard raw silk with aari embroidery framing the neckline and sleeve hems. Relaxed through the body with side slits for movement. Styled here with our Tara palazzo.",
    category: "tops",
    collections: ["sage-fest"],
    images: [IMG.tops, IMG.p1],
    price: 7600,
    salePrice: 6200,
    sizes: sizesAll,
    colors: [
      { name: "Mustard", hex: "#C8952F" },
      { name: "Teal", hex: "#1F5C56" },
    ],
    stock: 34,
    material: "Raw silk",
    tags: ["kurta", "mustard", "silk", "festive"],
    featured: false,
    newArrival: true,
    bestSeller: true,
    soldCount: 58,
    rating: 4.5,
    reviewCount: 26,
  },
  {
    name: "Tara Pleated Silk Palazzo",
    slug: "tara-pleated-silk-palazzo",
    sku: "LBN-TA-PL",
    shortDescription: "Cream pleated silk palazzo with a soft elasticated waist.",
    description:
      "Fine knife pleats in cream silk georgette create beautiful movement. A soft elasticated waist sits comfortably high, finished with a concealed side zip. Fully lined.",
    category: "bottoms",
    collections: ["timeless-elegance"],
    images: [IMG.bottoms, IMG.dresses],
    price: 5900,
    salePrice: null,
    sizes: sizesAll,
    colors: [
      { name: "Cream", hex: "#EDE3D4" },
      { name: "Sage", hex: "#A9B09A" },
    ],
    stock: 26,
    material: "Silk georgette",
    tags: ["palazzo", "pleated", "cream", "bottom"],
    featured: false,
    newArrival: false,
    bestSeller: true,
    soldCount: 44,
    rating: 4.4,
    reviewCount: 15,
  },
  {
    name: "Lumen Cream Leather Tote",
    slug: "lumen-cream-leather-tote",
    sku: "LBN-LU-CR",
    shortDescription: "Structured cream leather tote with brushed gold hardware.",
    description:
      "Cut from full-grain leather and hand-finished in a small Dhaka workshop. Fits a 13-inch laptop, with an interior zip pocket and suede lining. Brushed gold hardware, detachable shoulder strap.",
    category: "accessories",
    collections: ["timeless-elegance"],
    images: [IMG.bags, IMG.featured],
    price: 12500,
    salePrice: 10500,
    sizes: ["One size"],
    colors: [
      { name: "Cream", hex: "#E4D6C2" },
      { name: "Cognac", hex: "#8A5A3B" },
    ],
    stock: 15,
    material: "Full-grain leather, suede lining",
    tags: ["bag", "tote", "leather", "accessories"],
    featured: true,
    newArrival: false,
    bestSeller: true,
    soldCount: 27,
    rating: 4.8,
    reviewCount: 11,
  },
  {
    name: "Heirloom Pearl Necklace",
    slug: "heirloom-pearl-necklace",
    sku: "LBN-HE-PL",
    shortDescription: "Hand-knotted freshwater pearl necklace with a gold vermeil clasp.",
    description:
      "A single strand of hand-knotted freshwater pearls, finished with a gold vermeil clasp. Presented in a LABONNO keepsake box. Each pearl is selected for lustre and matched by hand.",
    category: "accessories",
    collections: ["timeless-elegance"],
    images: [IMG.featured, IMG.bags],
    price: 15800,
    salePrice: null,
    sizes: ["One size"],
    colors: [{ name: "Pearl", hex: "#F2EDE4" }],
    stock: 7,
    material: "Freshwater pearls, gold vermeil",
    tags: ["jewellery", "pearl", "necklace", "gift"],
    featured: true,
    newArrival: false,
    bestSeller: false,
    soldCount: 19,
    rating: 5,
    reviewCount: 9,
  },
  {
    name: "Inaya Sage Anarkali Set",
    slug: "inaya-sage-anarkali-set",
    sku: "LBN-IN-SG",
    shortDescription: "Sage green anarkali with antique gold embroidery and organza dupatta.",
    description:
      "Our Sage Fest collection in its most wearable form: a floor-length anarkali in sage silk with antique gold embroidery at the yoke and hem, finished with a hand-edged organza dupatta.",
    category: "three-piece",
    collections: ["sage-fest"],
    images: [IMG.hero1, IMG.tops],
    price: 27500,
    salePrice: 23900,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sage", hex: "#9CA88F" },
      { name: "Antique gold", hex: "#A9906B" },
    ],
    stock: 11,
    material: "Silk with organza dupatta",
    tags: ["anarkali", "sage", "festive", "three piece"],
    featured: true,
    newArrival: true,
    bestSeller: false,
    soldCount: 17,
    rating: 4.7,
    reviewCount: 7,
  },
  {
    name: "Zara Jamdani Three Piece",
    slug: "zara-jamdani-three-piece",
    sku: "LBN-ZA-JD",
    shortDescription: "Unstitched jamdani three-piece in soft ivory and rose.",
    description:
      "An unstitched three-piece in handloom jamdani cotton: 3.5 yards for the kurta, 2.5 yards for the trouser and a woven dupatta. Tailor it to your own measurements, or ask our studio for made-to-measure finishing.",
    category: "three-piece",
    collections: ["timeless-elegance"],
    images: [IMG.p2, IMG.tops],
    price: 6900,
    salePrice: null,
    sizes: ["Unstitched"],
    colors: [
      { name: "Ivory", hex: "#F1E8DB" },
      { name: "Rose", hex: "#D9AFA6" },
    ],
    stock: 40,
    material: "Handloom jamdani cotton",
    tags: ["three piece", "jamdani", "unstitched", "cotton"],
    featured: false,
    newArrival: true,
    bestSeller: true,
    soldCount: 72,
    rating: 4.5,
    reviewCount: 34,
  },
  {
    name: "Noor Linen Kurta",
    slug: "noor-linen-kurta",
    sku: "LBN-NL-LN",
    shortDescription: "Ivory handwoven linen kurta with a shell-button placket.",
    description:
      "The everyday kurta: ivory handwoven linen, cut generously with a shell-button placket and side slits. Gets softer with every wash. Also available in deep teal.",
    category: "tops",
    collections: ["timeless-elegance"],
    images: [IMG.tops, IMG.bottoms],
    price: 4200,
    salePrice: null,
    sizes: sizesAll,
    colors: [
      { name: "Ivory", hex: "#F1E8DB" },
      { name: "Teal", hex: "#1F5C56" },
    ],
    stock: 48,
    material: "Handwoven linen",
    tags: ["kurta", "linen", "everyday", "ivory"],
    featured: false,
    newArrival: false,
    bestSeller: true,
    soldCount: 88,
    rating: 4.3,
    reviewCount: 29,
  },
  {
    name: "Velvet Luxe Clutch",
    slug: "velvet-luxe-clutch",
    sku: "LBN-VL-CL",
    shortDescription: "Burgundy velvet clutch with a hand-set crystal clasp.",
    description:
      "A small evening clutch in deep burgundy velvet, lined in silk with a hand-set crystal clasp. Fits a phone, cardholder and lipstick. Designed to pair with the Meher and Zohra pieces.",
    category: "accessories",
    collections: ["velvet-luxe"],
    images: [IMG.bags, IMG.p1],
    price: 5400,
    salePrice: 4400,
    sizes: ["One size"],
    colors: [
      { name: "Burgundy", hex: "#5C1F2B" },
      { name: "Black", hex: "#1C1B18" },
    ],
    stock: 4,
    material: "Cotton velvet, silk lining",
    tags: ["clutch", "velvet", "evening", "accessories"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    soldCount: 21,
    rating: 4.6,
    reviewCount: 6,
  },
  {
    name: "Aurora Ivory Silk Blouse",
    slug: "aurora-ivory-silk-blouse",
    sku: "LBN-AU-IV",
    shortDescription: "Ivory silk blouse with covered buttons, made to pair with our sarees.",
    description:
      "A softly tailored ivory silk blouse designed to sit under our sarees. Three-quarter sleeves, covered buttons and a clean neckline that frames jewellery without competing with it.",
    category: "tops",
    collections: ["timeless-elegance"],
    images: [IMG.dresses, IMG.tops],
    price: 4800,
    salePrice: 3900,
    sizes: sizesAll,
    colors: [
      { name: "Ivory", hex: "#F3EDE3" },
      { name: "Champagne", hex: "#D9C7A7" },
    ],
    stock: 24,
    material: "Mulberry silk",
    tags: ["blouse", "silk", "ivory", "saree blouse"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    soldCount: 33,
    rating: 4.4,
    reviewCount: 12,
  },
  {
    name: "Dew Organza Dupatta",
    slug: "dew-organza-dupatta",
    sku: "LBN-DW-OG",
    shortDescription: "Featherweight organza dupatta with hand-rolled edges.",
    description:
      "A single-layer organza dupatta that adds lightness to any outfit. Hand-rolled edges, with a subtle gold thread running through the border. Available in ivory and sage.",
    category: "accessories",
    collections: ["sage-fest"],
    images: [IMG.p2, IMG.featured],
    price: 3200,
    salePrice: null,
    sizes: ["One size"],
    colors: [
      { name: "Ivory", hex: "#F1E8DB" },
      { name: "Sage", hex: "#9CA88F" },
    ],
    stock: 3,
    material: "Silk organza",
    tags: ["dupatta", "organza", "accessory"],
    featured: false,
    newArrival: false,
    bestSeller: false,
    soldCount: 26,
    rating: 4.2,
    reviewCount: 5,
  },
];

function buildProduct(p: SeedProduct): ProductDoc {
  const colors = p.colors.map((c) => c.name);
  const rows = makeVariants(p.sku, p.sizes, colors, 8);
  const totalStock = rows.reduce((sum, r) => sum + r.stock, 0);
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category,
    collections: p.collections,
    images: p.images,
    price: p.price,
    salePrice: p.salePrice ?? null,
    sizes: p.sizes,
    colors: p.colors,
    variants: rows,
    stock: p.stock || totalStock,
    material: p.material,
    careInstructions: "Dry clean only. Store in the muslin bag provided. Do not hang heavy embroidery.",
    tags: p.tags,
    featured: p.featured,
    newArrival: p.newArrival,
    bestSeller: p.bestSeller,
    status: "published",
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    seo: {
      title: `${p.name} — LABONNO`,
      description: p.shortDescription,
      keywords: p.tags,
    },
    createdAt: daysAgo(p.newArrival ? 6 : 60),
    updatedAt: now,
  };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "labonno";
  if (!uri) throw new Error("MONGODB_URI missing");

  const { createAuth } = await import("../lib/auth/core");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to ${dbName}`);

  // Wipe application collections (never the auth sessions of a live deployment).
  const toDrop = [
    "products",
    "categories",
    "collections",
    "orders",
    "reviews",
    "coupons",
    "banners",
    "homepage_sections",
    "content_pages",
    "site_settings",
    "inventory_logs",
    "wishlists",
    "subscribers",
    "media",
    "audit_logs",
  ];
  for (const name of toDrop) {
    await db.collection(name).deleteMany({});
  }
  await db.collection("user").deleteMany({});
  await db.collection("session").deleteMany({});
  await db.collection("account").deleteMany({});

  // ---------- indexes ----------
  const indexOps = [
    db.collection("user").createIndex({ email: 1 }, { unique: true }),
    db.collection("products").createIndex({ slug: 1 }, { unique: true }),
    db.collection("products").createIndex({ sku: 1 }, { unique: true }),
    db.collection("products").createIndex({ category: 1, status: 1 }),
    db.collection("products").createIndex({ collections: 1 }),
    db.collection("products").createIndex({ name: "text", shortDescription: "text", tags: "text" }),
    db.collection("orders").createIndex({ orderNumber: 1 }, { unique: true }),
    db.collection("orders").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("orders").createIndex({ "customer.phone": 1 }),
    db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
    db.collection("collections").createIndex({ slug: 1 }, { unique: true }),
    db.collection("content_pages").createIndex({ slug: 1 }, { unique: true }),
    db.collection("coupons").createIndex({ code: 1 }, { unique: true }),
    db.collection("homepage_sections").createIndex({ key: 1 }, { unique: true }),
    db.collection("wishlists").createIndex({ userId: 1 }, { unique: true }),
    db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
  ];
  await Promise.all(indexOps);
  console.log("Indexes ready");

  // ---------- catalogue ----------
  await db.collection<CategoryDoc>("categories").insertMany(categories);
  await db.collection<CollectionDoc>("collections").insertMany(collections);
  const productDocs = seedProducts.map(buildProduct);
  const productResult = await db.collection<ProductDoc>("products").insertMany(productDocs);
  console.log(`${productDocs.length} products seeded`);

  // ---------- CMS ----------
  const settings: SiteSettingsDoc = {
    _id: "site",
    general: {
      brandName: "LABONNO",
      brandNameBn: "লাবণ্য",
      tagline: "The Art of Elegance",
      announcement: "Free shipping across Bangladesh on orders over ৳2,000 · Handcrafted couture",
      email: "hello@labonno.com",
      phone: "+880 1700 000 000",
      whatsapp: "+8801700000000",
      address: "House 27, Road 11, Banani, Dhaka 1213",
      currency: "BDT",
      currencySymbol: "৳",
      openGraphImage: IMG.hero1,
    },
    appearance: {
      logoText: "LABONNO",
      logoImage: "",
      favicon: "/favicon.svg",
      accentColor: "#A9906B",
      serifFont: "Cormorant Garamond",
      sansFont: "Jost",
    },
    navigation: {
      header: [
        {
          label: "Shop",
          href: "/shop",
          children: [
            { label: "Shop all", href: "/shop" },
            { label: "Saree", href: "/category/saree" },
            { label: "Three piece", href: "/category/three-piece" },
            { label: "Dresses", href: "/category/dresses" },
            { label: "Tops", href: "/category/tops" },
            { label: "Bottoms", href: "/category/bottoms" },
            { label: "Bags & accessories", href: "/category/accessories" },
          ],
        },
        {
          label: "Collections",
          href: "/collections",
          children: [
            { label: "Timeless Elegance", href: "/collections/timeless-elegance" },
            { label: "Black Zari", href: "/collections/black-zari" },
            { label: "Sage Fest", href: "/collections/sage-fest" },
            { label: "Velvet Luxe", href: "/collections/velvet-luxe" },
          ],
        },
        { label: "New Arrivals", href: "/shop?sort=newest", children: [] },
        { label: "About", href: "/about", children: [] },
      ],
      footer: [
        {
          title: "Shop",
          links: [
            { label: "Shop all", href: "/shop" },
            { label: "Categories", href: "/categories" },
            { label: "Collections", href: "/collections" },
            { label: "New arrivals", href: "/shop?sort=newest" },
          ],
        },
        {
          title: "Client care",
          links: [
            { label: "Contact", href: "/contact" },
            { label: "FAQ", href: "/faq" },
            { label: "Size guide", href: "/size-guide" },
            { label: "Track order", href: "/track-order" },
          ],
        },
        {
          title: "Policies",
          links: [
            { label: "Shipping policy", href: "/shipping-policy" },
            { label: "Return & refund", href: "/return-policy" },
            { label: "Privacy policy", href: "/privacy-policy" },
            { label: "Terms & conditions", href: "/terms" },
          ],
        },
      ],
      social: [
        { platform: "instagram", href: "https://instagram.com/labonno" },
        { platform: "facebook", href: "https://facebook.com/labonno" },
        { platform: "youtube", href: "https://youtube.com/@labonno" },
      ],
    },
    payments: {
      cod: { enabled: true, instructions: "Pay in cash when your order is delivered. Available nationwide." },
      bkash: {
        enabled: true,
        number: "01711 000 000",
        instructions:
          "Send the exact total to our bKash merchant number, then enter your bKash number and transaction ID. Our team verifies every payment before dispatch.",
      },
      nagad: {
        enabled: true,
        number: "01711 000 000",
        instructions:
          "Send the exact total to our Nagad merchant number, then enter your Nagad number and transaction ID. Our team verifies every payment before dispatch.",
      },
      sslcommerz: {
        enabled: false,
        instructions: "Card and mobile banking payments are processed securely through SSLCommerz.",
      },
    },
    shipping: {
      defaultCharge: 150,
      freeShippingThreshold: 2000,
      insideDhakaCharge: 80,
      outsideDhakaCharge: 150,
      zones: [
        { district: "Dhaka", charge: 80 },
        { district: "Gazipur", charge: 120 },
        { district: "Narayanganj", charge: 120 },
        { district: "Chattogram", charge: 150 },
        { district: "Sylhet", charge: 160 },
      ],
      deliveryEstimate: "Inside Dhaka 2–3 business days · Outside Dhaka 3–5 business days",
      returnWindowDays: 7,
    },
    newsletter: {
      title: "Labonno",
      subtitle: "Get the latest trends & exclusive offers straight from our studio.",
      image: IMG.bags,
      buttonLabel: "Subscribe",
    },
    seo: {
      defaultTitle: "LABONNO — The Art of Elegance",
      titleTemplate: "%s · LABONNO",
      defaultDescription:
        "Handcrafted luxury womenswear from Dhaka: sarees, three-piece sets, dresses and accessories made in limited runs.",
      keywords: ["luxury fashion bangladesh", "designer saree", "three piece", "labonno", "handcrafted couture"],
    },
    updatedAt: now,
  };
  await db.collection("site_settings").insertOne(settings as unknown as Record<string, unknown>);

  const banners: BannerDoc[] = [
    {
      placement: "home_hero",
      title: "Elevate Your Style",
      subtitle: "with Labonno",
      eyebrow: "New arrivals",
      image: IMG.hero1,
      mobileImage: IMG.hero1,
      ctaLabel: "Shop the look",
      ctaHref: "/collections/sage-fest",
      align: "left",
      order: 1,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      placement: "home_hero",
      title: "The Saree, Reimagined",
      subtitle: "handwoven for today",
      eyebrow: "Timeless elegance",
      image: IMG.hero2,
      mobileImage: IMG.hero2,
      ctaLabel: "Discover sarees",
      ctaHref: "/category/saree",
      align: "left",
      order: 2,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.collection<BannerDoc>("banners").insertMany(banners);

  const sections: HomepageSectionDoc[] = [
    {
      key: "hero",
      type: "hero",
      label: "Hero carousel",
      title: "Hero",
      subtitle: "",
      visible: true,
      order: 1,
      data: { autoPlay: true },
      updatedAt: now,
    },
    {
      key: "categories",
      type: "category_arches",
      label: "Shop by category",
      title: "Shop by category",
      subtitle: "",
      visible: true,
      order: 2,
      data: { categorySlugs: ["dresses", "tops", "bottoms", "accessories"] },
      updatedAt: now,
    },
    {
      key: "featured-collection",
      type: "featured_collection",
      label: "Featured collection",
      title: "Featured collection",
      subtitle: "Pearls, ivory silk and quiet glamour",
      visible: true,
      order: 3,
      data: {
        collectionSlug: "timeless-elegance",
        headline: "Timeless Elegance",
        subtitle: "Pearls, ivory silk and quiet glamour",
        image: IMG.featured,
        ctaLabel: "Explore collection",
        ctaHref: "/collections/timeless-elegance",
      },
      updatedAt: now,
    },
    {
      key: "best-sellers",
      type: "product_grid",
      label: "Best sellers",
      title: "Best Sellers",
      subtitle: "",
      visible: true,
      order: 4,
      data: { source: "bestSellers", limit: 4, ctaLabel: "View all", ctaHref: "/shop?sort=bestselling" },
      updatedAt: now,
    },
    {
      key: "editorial",
      type: "editorial",
      label: "House editorial",
      title: "Made slowly, in Dhaka",
      subtitle: "",
      visible: true,
      order: 5,
      data: {
        eyebrow: "The house",
        body: "Every LABONNO piece begins on paper and ends in the hands of an artisan. We work with jamdani weavers in Rupganj, zardozi karigars in Old Dhaka and a small tailoring studio in Banani — producing in limited runs so that nothing is rushed and nothing is wasted.",
        image: IMG.tops,
        ctaLabel: "Our story",
        ctaHref: "/about",
        imagePosition: "right",
      },
      updatedAt: now,
    },
    {
      key: "newsletter",
      type: "newsletter",
      label: "Newsletter",
      title: "Be a part of Labonno",
      subtitle: "Get the latest trends & exclusive offers straight from our studio.",
      visible: true,
      order: 6,
      data: {},
      updatedAt: now,
    },
  ];
  await db.collection<HomepageSectionDoc>("homepage_sections").insertMany(sections);

  const pageBodies: Record<string, { title: string; excerpt: string; content: string; showInFooter?: boolean }> = {
    about: {
      title: "About Labonno",
      excerpt: "A Dhaka house built on handcraft, patient design and considered quantities.",
      content: `<h2>Our beginning</h2><p>LABONNO was founded in Dhaka in 2021 with a simple intention: to make clothes that could be worn for years rather than seasons. The name means grace — the kind that comes from craft rather than decoration.</p><p>We began with twelve sarees woven in Rupganj and sold them from a studio in Banani. Today the house works with more than forty weavers, embroiderers and tailors across Bangladesh, and still produces every collection in limited runs.</p><h2>How we make</h2><p>Each design starts as a drawing, is developed into a handloom or embroidery sample, and is only put into production once it passes our studio review. A single Zohra lehenga takes roughly six weeks of hand work. We do not rush this.</p><h2>Our people</h2><p>Our karigars are paid per piece at rates set with them, not for them. Where possible we work directly, without intermediaries, and we publish our fabric sources to clients on request.</p><h2>The studio</h2><p>You are welcome to visit us at House 27, Road 11, Banani, Dhaka. Fittings and made-to-measure appointments are available Sunday to Thursday, 11am–7pm.</p>`,
      showInFooter: true,
    },
    faq: {
      title: "Frequently asked questions",
      excerpt: "Sizing, made-to-order pieces, delivery, payments and returns.",
      content: `<h2>Orders & sizing</h2><p><strong>How do I choose a size?</strong> Every product page links to our size guide with garment measurements. If you are between sizes, our studio is happy to advise — message us on WhatsApp with your measurements.</p><p><strong>Do you offer made-to-measure?</strong> Yes. Pieces marked "made to order" can be tailored to your measurements at no extra cost; add your measurements in the order notes and allow 10–14 extra days.</p><h2>Delivery</h2><p><strong>Where do you deliver?</strong> Across all 64 districts of Bangladesh. Inside Dhaka typically arrives in 2–3 business days, outside Dhaka in 3–5.</p><p><strong>Can I collect from the studio?</strong> Yes, choose "studio pickup" when you confirm your order by phone and we will hold it for 7 days.</p><h2>Payments</h2><p><strong>Which methods do you accept?</strong> Cash on delivery, bKash and Nagad. Card payments through SSLCommerz are available when enabled by our team.</p><p><strong>How is a bKash payment verified?</strong> You send the total to our merchant number and enter your transaction ID at checkout. Our team verifies each transaction with bKash before dispatch — we never mark an order paid automatically.</p><h2>Returns</h2><p><strong>What is your return window?</strong> Seven days from delivery for unworn, unaltered pieces with tags attached. Made-to-order and altered pieces are final sale. See our Return & Refund policy for details.</p>`,
      showInFooter: true,
    },
    "size-guide": {
      title: "Size guide",
      excerpt: "Garment measurements in inches, plus advice from our studio.",
      content: `<h2>How to measure</h2><p>Use a soft tape measure over light clothing. Keep the tape level and snug but not tight. If you are between sizes, size up — our pieces are designed to be tailored.</p><ul><li><strong>Bust:</strong> around the fullest part of your chest</li><li><strong>Waist:</strong> at the narrowest part of your torso</li><li><strong>Hip:</strong> around the fullest part of your hips</li><li><strong>Length:</strong> from shoulder to your desired hem</li></ul><h2>Women's sizing (inches)</h2><table><thead><tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hip</th></tr></thead><tbody><tr><td>XS</td><td>32</td><td>25</td><td>35</td></tr><tr><td>S</td><td>34</td><td>27</td><td>37</td></tr><tr><td>M</td><td>36</td><td>29</td><td>39</td></tr><tr><td>L</td><td>38</td><td>31</td><td>41</td></tr><tr><td>XL</td><td>40</td><td>33</td><td>43</td></tr></tbody></table><p>Unstitched three-piece sets include 3.5 yards for the kurta and 2.5 yards for trousers, suitable for sizes up to XL. Sarees are one size with an unstitched blouse piece of 0.8m.</p>`,
      showInFooter: true,
    },
    "shipping-policy": {
      title: "Shipping policy",
      excerpt: "Delivery times, charges and studio pickup across Bangladesh.",
      content: `<h2>Delivery times</h2><p>Orders are dispatched within 24–48 hours of payment verification (or order confirmation for cash on delivery). Inside Dhaka: 2–3 business days. Outside Dhaka: 3–5 business days. Made-to-order pieces add 10–14 days.</p><h2>Charges</h2><ul><li>Inside Dhaka: ৳80</li><li>Outside Dhaka: ৳150</li><li>Free delivery on orders over ৳2,000</li></ul><p>Charges are calculated at checkout based on your district and shown in your order summary before payment.</p><h2>Tracking</h2><p>Every order receives a LABONNO order number (for example LBN-260102-4821). Track it any time at <a href="/track-order">Track order</a> using your order number and mobile number.</p><h2>Studio pickup</h2><p>Select pickup when we call to confirm and collect from House 27, Road 11, Banani, Dhaka 1213, Sunday–Thursday, 11am–7pm.</p>`,
      showInFooter: true,
    },
    "return-policy": {
      title: "Return & refund policy",
      excerpt: "Seven-day returns on unworn pieces, and how refunds are processed.",
      content: `<h2>Return window</h2><p>You may request a return within 7 days of delivery. Pieces must be unworn, unwashed, unaltered and returned with original tags and packaging.</p><h2>Non-returnable</h2><ul><li>Made-to-measure or altered pieces</li><li>Jewellery and accessories for hygiene reasons</li><li>Sale items marked final sale</li><li>Pieces damaged by the customer</li></ul><h2>How to return</h2><p>Message our studio with your order number and reason. We will arrange a pickup where available, or ask you to courier the piece to our Banani studio. Return courier charges are the customer's responsibility unless the piece is faulty.</p><h2>Refunds</h2><p>Once we receive and inspect the return, refunds are issued within 5–7 business days to bKash, Nagad or your original payment method. Cash on delivery orders are refunded by bKash or bank transfer. Delivery charges are non-refundable.</p><h2>Exchanges</h2><p>Exchanges for size are free once per order, subject to stock availability. Contact us within 48 hours of delivery.</p>`,
      showInFooter: true,
    },
    "privacy-policy": {
      title: "Privacy policy",
      excerpt: "What we collect, why we collect it, and how we protect it.",
      content: `<h2>Information we collect</h2><p>We collect the details you give us when you place an order or create an account: name, email, mobile number and delivery address. Payment details such as bKash transaction IDs are recorded to verify payment; we never store card numbers.</p><h2>How we use it</h2><ul><li>To process, deliver and support your orders</li><li>To verify payments and prevent fraud</li><li>To send order updates, and marketing only if you opt in</li></ul><h2>Sharing</h2><p>We share delivery details with our courier partners and payment references with our payment providers, only as required to complete your order. We do not sell personal data.</p><h2>Security</h2><p>Passwords are hashed, sessions are stored securely, and all sensitive operations are checked on our servers. Access to customer records is restricted to authorised staff.</p><h2>Your rights</h2><p>You may request a copy of your data, correct it, or ask us to delete your account by emailing hello@labonno.com.</p>`,
    },
    terms: {
      title: "Terms & conditions",
      excerpt: "The terms that apply when you shop with LABONNO.",
      content: `<h2>Using this site</h2><p>By placing an order you confirm the information you provide is accurate and that you are authorised to use the payment method selected.</p><h2>Pricing</h2><p>All prices are in Bangladeshi Taka (BDT) and include applicable taxes. We reserve the right to correct pricing errors before dispatch; if a correction is required we will contact you and offer a full refund.</p><h2>Orders</h2><p>Orders are confirmed once we have verified stock and, where relevant, payment. We may cancel an order if an item is unavailable or if fraud is suspected, and will refund any amount already paid.</p><h2>Handcrafted variation</h2><p>Handloom and hand-embroidered pieces may vary slightly in motif, colour depth and finish. These variations are inherent to the craft and are not considered defects.</p><h2>Intellectual property</h2><p>All designs, photography and copy on this site belong to LABONNO and may not be reproduced without written permission.</p><h2>Governing law</h2><p>These terms are governed by the laws of Bangladesh.</p>`,
    },
    contact: {
      title: "Contact us",
      excerpt: "Reach the studio for orders, fittings and made-to-measure enquiries.",
      content: `<h2>Studio</h2><p>House 27, Road 11, Banani, Dhaka 1213, Bangladesh</p><p>Sunday–Thursday, 11am–7pm</p><h2>General enquiries</h2><p>hello@labonno.com · +880 1700 000 000</p><h2>Orders & delivery</h2><p>orders@labonno.com · WhatsApp +880 1700 000 001</p><h2>Press & collaborations</h2><p>press@labonno.com</p>`,
    },
    "studio-notes": {
      title: "Studio notes",
      excerpt: "Inside the LABONNO atelier.",
      content: `<h2>Inside the atelier</h2><p>Our Banani studio holds the archive, the fitting room and the sample rail. Appointments are available Sunday to Thursday.</p><p>For made-to-measure, allow two visits: one for measurements and one for the final fitting.</p>`,
    },
  };

  const pages: PageDoc[] = Object.entries(pageBodies).map(([slug, value]) => ({
    slug,
    title: value.title,
    excerpt: value.excerpt,
    content: value.content,
    published: true,
    showInFooter: Boolean(value.showInFooter),
    seo: { title: `${value.title} · LABONNO`, description: value.excerpt },
    createdAt: now,
    updatedAt: now,
  }));
  await db.collection<PageDoc>("content_pages").insertMany(pages);

  const coupons: CouponDoc[] = [
    {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "percentage",
      value: 10,
      minSubtotal: 3000,
      maxDiscount: 2000,
      usageLimit: 500,
      usedCount: 12,
      perUserLimit: 1,
      startDate: daysAgo(30),
      endDate: new Date(now.getTime() + 180 * 86_400_000),
      active: true,
      createdAt: daysAgo(30),
      updatedAt: now,
    },
    {
      code: "EID1500",
      description: "৳1,500 off orders over ৳15,000",
      type: "fixed",
      value: 1500,
      minSubtotal: 15000,
      maxDiscount: null,
      usageLimit: 100,
      usedCount: 4,
      perUserLimit: 1,
      startDate: daysAgo(10),
      endDate: new Date(now.getTime() + 60 * 86_400_000),
      active: true,
      createdAt: daysAgo(10),
      updatedAt: now,
    },
    {
      code: "STUDIO5",
      description: "5% studio welcome — expiring soon",
      type: "percentage",
      value: 5,
      minSubtotal: 0,
      maxDiscount: 1000,
      usageLimit: 200,
      usedCount: 31,
      perUserLimit: 2,
      startDate: daysAgo(90),
      endDate: daysAgo(5),
      active: true,
      createdAt: daysAgo(90),
      updatedAt: now,
    },
  ];
  await db.collection<CouponDoc>("coupons").insertMany(coupons);

  // ---------- users ----------
  const auth = createAuth({ withNextCookies: false });
  const accountSpecs = [
    {
      name: "Labonno Admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@labonno.com",
      password: process.env.SEED_ADMIN_PASSWORD || "Labonno@2026",
      role: "super_admin",
      phone: "01711000000",
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

  for (const spec of accountSpecs) {
    try {
      await auth.api.signUpEmail({
        body: { name: spec.name, email: spec.email, password: spec.password, phone: spec.phone },
      });
    } catch (error) {
      console.warn(`Sign-up skipped for ${spec.email}:`, (error as Error).message);
    }
    await db.collection("user").updateOne(
      { email: spec.email },
      { $set: { role: spec.role, phone: spec.phone, emailVerified: true } }
    );
    console.log(`Account ready: ${spec.email} (${spec.role})`);
  }

  const customer = await db.collection("user").findOne({ email: process.env.SEED_CUSTOMER_EMAIL || "customer@labonno.com" });
  const customerId = customer ? String(customer._id) : null;

  // ---------- reviews ----------
  const reviewSeeds = [
    { slug: "noor-champagne-saree", author: "Farhana R.", rating: 5, title: "Weightless and beautifully finished", body: "The jamdani is even finer than the photographs suggest. The border is hand-rolled and the fall drapes perfectly. Wore it to my sister's holud and had three people ask where it was from." },
    { slug: "meher-burgundy-zardozi-kurta", author: "Tahmina A.", rating: 5, title: "Worth the wait", body: "Ordered in November and it arrived in nine days. The zardozi is dense and even, not the glued-on work you see elsewhere. The trousers are beautifully cut too." },
    { slug: "roshni-blush-silk-slip-dress", author: "Sadia K.", rating: 4, title: "Lovely silk, runs slightly small", body: "The silk is genuinely 19-momme — heavy and cool. I sized up from my usual S and it drapes better. Studio was quick to answer on WhatsApp about the fit." },
    { slug: "ayan-black-zari-kurta-set", author: "Reem H.", rating: 5, title: "The black zari is the one", body: "Wore this to a reception with the organza dupatta. Quietly glamorous and didn't feel like a costume. The silver zari catches light without being loud." },
    { slug: "tara-pleated-silk-palazzo", author: "Nabila S.", rating: 4, title: "Pleats hold beautifully", body: "Steamed once and the pleats lasted through a long day. Waist runs a touch generous, which I prefer." },
  ];
  const reviewDocs: ReviewDoc[] = [];
  for (const r of reviewSeeds) {
    const product = productResult.insertedIds && (await db.collection<ProductDoc>("products").findOne({ slug: r.slug }));
    if (!product) continue;
    reviewDocs.push({
      productId: String(product._id),
      productSlug: product.slug,
      productName: product.name,
      userId: customerId,
      author: r.author,
      rating: r.rating,
      title: r.title,
      body: r.body,
      status: "approved",
      verifiedPurchase: true,
      createdAt: daysAgo(12),
      updatedAt: now,
    });
  }
  const noorProduct = await db.collection<ProductDoc>("products").findOne({ slug: "noor-champagne-saree" });
  reviewDocs.push({
    productId: noorProduct ? String(noorProduct._id) : "",
    productSlug: "noor-champagne-saree",
    productName: "Noor Champagne Saree",
    userId: null,
    author: "Anonymous",
    rating: 5,
    title: "Awaiting moderation",
    body: "Submitted through the storefront so the admin review queue has something to moderate.",
    status: "pending",
    verifiedPurchase: false,
    createdAt: daysAgo(1),
    updatedAt: now,
  });
  await db.collection<ReviewDoc>("reviews").insertMany(reviewDocs);

  // ---------- sample orders ----------
  const allProducts = await db.collection<ProductDoc>("products").find({}).toArray();
  const pick = (index: number) => allProducts[index % allProducts.length];
  const orderStatuses: { status: OrderDoc["status"]; payment: OrderDoc["paymentStatus"]; days: number }[] = [
    { status: "delivered", payment: "paid", days: 26 },
    { status: "delivered", payment: "paid", days: 18 },
    { status: "shipped", payment: "paid", days: 9 },
    { status: "processing", payment: "pending_verification", days: 5 },
    { status: "confirmed", payment: "unpaid", days: 2 },
    { status: "pending", payment: "unpaid", days: 1 },
    { status: "cancelled", payment: "unpaid", days: 14 },
    { status: "delivered", payment: "paid", days: 3 },
  ];
  const orderCustomers = [
    { name: "Nusrat Jahan", email: "customer@labonno.com", phone: "01812345678", district: "Dhaka" },
    { name: "Farhana Rahman", email: "farhana@example.com", phone: "01711223344", district: "Dhaka" },
    { name: "Tahmina Akter", email: "tahmina@example.com", phone: "01922334455", district: "Chattogram" },
    { name: "Sadia Karim", email: "sadia@example.com", phone: "01633445566", district: "Sylhet" },
    { name: "Reem Hossain", email: "reem@example.com", phone: "01544556677", district: "Dhaka" },
  ];

  const orders: OrderDoc[] = orderStatuses.map((spec, i) => {
    const customer = orderCustomers[i % orderCustomers.length];
    const product = pick(i);
    const variant = product.variants[0];
    const qty = i % 3 === 0 ? 2 : 1;
    const subtotal = (product.salePrice ?? product.price) * qty;
    const deliveryCharge = subtotal >= 2000 ? 0 : 80;
    const createdAt = daysAgo(spec.days);
    return {
      orderNumber: `LBN-${String(createdAt.getFullYear()).slice(2)}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(createdAt.getDate()).padStart(2, "0")}-${1000 + i}`,
      userId: i === 0 ? customerId : null,
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
      shippingAddress: {
        address: "House 12, Road 5, Block C",
        area: customer.district === "Dhaka" ? "Banani" : "Kotwali",
        district: customer.district,
        note: "",
      },
      items: [
        {
          productId: String(product._id),
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: product.salePrice ?? product.price,
          quantity: qty,
          lineTotal: subtotal,
        },
      ],
      subtotal,
      discount: 0,
      deliveryCharge,
      total: subtotal + deliveryCharge,
      coupon: null,
      paymentMethod: i % 4 === 0 ? "cod" : i % 3 === 0 ? "bkash" : "cod",
      paymentStatus: spec.payment,
      paymentRef: spec.payment === "paid" ? { provider: "bkash", transactionId: `TRX${9000 + i}`, paidAt: createdAt } : null,
      status: spec.status,
      statusHistory: [{ status: spec.status, note: "Seeded order", at: createdAt }],
      inventoryApplied: true,
      createdAt,
      updatedAt: createdAt,
    };
  });
  await db.collection<OrderDoc>("orders").insertMany(orders);
  console.log(`${orders.length} sample orders seeded`);

  await db.collection("subscribers").insertMany([
    { email: "farhana@example.com", source: "homepage", createdAt: daysAgo(20) },
    { email: "tahmina@example.com", source: "footer", createdAt: daysAgo(8) },
  ]);

  await db.collection("inventory_logs").insertMany([
    {
      productId: String(allProducts[0]._id),
      productName: allProducts[0].name,
      sku: allProducts[0].sku,
      change: -2,
      previousStock: 14,
      newStock: 12,
      reason: "order.reserve",
      orderNumber: orders[0].orderNumber,
      actor: "seed",
      createdAt: daysAgo(26),
    },
    {
      productId: String(allProducts[1]._id),
      productName: allProducts[1].name,
      sku: allProducts[1].sku,
      change: 10,
      previousStock: 0,
      newStock: 10,
      reason: "restock",
      actor: "admin@labonno.com",
      createdAt: daysAgo(15),
    },
  ]);

  console.log("\nSeed complete.");
  console.log("  Super admin : ", process.env.SEED_ADMIN_EMAIL || "admin@labonno.com", "/", process.env.SEED_ADMIN_PASSWORD || "Labonno@2026");
  console.log("  Admin       : ", process.env.SEED_STAFF_EMAIL || "manager@labonno.com", "/", process.env.SEED_STAFF_PASSWORD || "Labonno@2026");
  console.log("  Customer    : ", process.env.SEED_CUSTOMER_EMAIL || "customer@labonno.com", "/", process.env.SEED_CUSTOMER_PASSWORD || "Labonno@2026");

  await client.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
