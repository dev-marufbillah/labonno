import type { ObjectId } from "mongodb";

export type Role = "customer" | "admin" | "super_admin";

export type ProductStatus = "published" | "draft" | "archived";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
  price?: number;
  salePrice?: number;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ProductDoc {
  _id?: ObjectId;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  category: string; // category slug
  collections: string[]; // collection slugs
  images: string[];
  price: number;
  salePrice?: number | null;
  sizes: string[];
  colors: ColorOption[];
  variants: ProductVariant[];
  stock: number;
  material?: string;
  careInstructions?: string;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  soldCount: number;
  seo?: SeoMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDoc {
  _id?: ObjectId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  order: number;
  visible: boolean;
  showOnHome: boolean;
  seo?: SeoMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionDoc {
  _id?: ObjectId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  order: number;
  visible: boolean;
  featured: boolean;
  seo?: SeoMeta;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "pending_verification" | "paid" | "refunded" | "failed";

/**
 * Payment methods are data, not code: the admin panel can add any number of them
 * (bKash, Nagad, card, bank transfer, cash on delivery…) and checkout renders whatever
 * is enabled. The four original keys stay in the union for autocomplete.
 */
export type PaymentMethod = "cod" | "bkash" | "nagad" | "sslcommerz" | (string & {});

export type PaymentKind = "manual" | "gateway";
export type PaymentGateway = "bkash" | "sslcommerz" | null;

export interface PaymentMethodDoc {
  _id?: ObjectId;
  /** Stable identifier stored on orders; lowercase, no spaces. */
  key: string;
  label: string;
  kind: PaymentKind;
  enabled: boolean;
  order: number;
  description: string;
  instructions: string;
  /** Manual methods: the number/account customers send money to. */
  number?: string;
  accountType?: string;
  /** Manual methods ask for the sender number + transaction id at checkout. */
  requiresReference: boolean;
  /** Gateway methods redirect to the provider instead of collecting a reference. */
  gateway: PaymentGateway;
  badge?: string;
  /** Gateway credentials. Empty means "use the environment variables". */
  config?: {
    appKey?: string;
    appSecret?: string;
    username?: string;
    password?: string;
    storeId?: string;
    storePassword?: string;
    sandbox?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDoc {
  _id?: ObjectId;
  orderNumber: string;
  userId?: string | null;
  customer: { name: string; email: string; phone: string };
  shippingAddress: {
    address: string;
    area: string;
    district: string;
    postcode?: string;
    note?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  coupon?: { code: string; type: "percentage" | "fixed"; value: number } | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef?: { provider: string; transactionId?: string; senderNumber?: string; gatewayRef?: string; paidAt?: Date } | null;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; note?: string; at: Date; by?: string }[];
  customerNote?: string;
  inventoryApplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponDoc {
  _id?: ObjectId;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDoc {
  _id?: ObjectId;
  productId: string;
  productSlug: string;
  productName: string;
  userId?: string | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SectionType =
  | "hero"
  | "category_arches"
  | "featured_collection"
  | "product_grid"
  | "offers"
  | "editorial"
  | "newsletter";

export interface HomepageSectionDoc {
  _id?: ObjectId;
  key: string;
  type: SectionType;
  label: string;
  title: string;
  subtitle: string;
  visible: boolean;
  order: number;
  data: Record<string, unknown>;
  updatedAt: Date;
}

export interface BannerDoc {
  _id?: ObjectId;
  placement: "home_hero" | "promo" | "category" | "popup";
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  mobileImage?: string;
  ctaLabel: string;
  ctaHref: string;
  align: "left" | "center" | "right";
  order: number;
  visible: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageDoc {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  /** Rich text stored as lightweight HTML produced by the admin editor. */
  content: string;
  published: boolean;
  showInFooter: boolean;
  seo?: SeoMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettingsDoc {
  _id: "site";
  general: {
    brandName: string;
    brandNameBn: string;
    tagline: string;
    announcement: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    currency: string;
    currencySymbol: string;
    openGraphImage: string;
  };
  appearance: {
    logoText: string;
    logoImage: string;
    favicon: string;
    accentColor: string;
    serifFont: string;
    sansFont: string;
  };
  navigation: {
    header: { label: string; href: string; children: { label: string; href: string }[] }[];
    footer: { title: string; links: { label: string; href: string }[] }[];
    social: { platform: string; href: string }[];
  };
  payments: {
    cod: { enabled: boolean; instructions: string };
    bkash: { enabled: boolean; number: string; instructions: string };
    nagad: { enabled: boolean; number: string; instructions: string };
    sslcommerz: { enabled: boolean; instructions: string };
  };
  shipping: {
    defaultCharge: number;
    freeShippingThreshold: number;
    insideDhakaCharge: number;
    outsideDhakaCharge: number;
    zones: { district: string; charge: number }[];
    deliveryEstimate: string;
    returnWindowDays: number;
  };
  newsletter: { title: string; subtitle: string; image: string; buttonLabel: string };
  /** Owner addresses — these accounts always keep studio access. */
  access?: { ownerEmails: string[] };
  seo: { defaultTitle: string; titleTemplate: string; defaultDescription: string; keywords: string[] };
  updatedAt: Date;
}

export interface InventoryLogDoc {
  _id?: ObjectId;
  productId: string;
  productName: string;
  sku: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  orderNumber?: string;
  actor?: string;
  createdAt: Date;
}

export interface AddressDoc {
  _id?: ObjectId;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  area: string;
  district: string;
  postcode?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistDoc {
  _id?: ObjectId;
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

export interface SubscriberDoc {
  _id?: ObjectId;
  email: string;
  source: string;
  createdAt: Date;
}

export interface MediaDoc {
  _id?: ObjectId;
  url: string;
  publicId?: string;
  alt: string;
  folder: string;
  width?: number;
  height?: number;
  bytes?: number;
  createdAt: Date;
}

export interface AuditLogDoc {
  _id?: ObjectId;
  actorId: string;
  actorEmail: string;
  action: string;
  target: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

export interface FaqDoc {
  _id?: ObjectId;
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
  updatedAt: Date;
}

export interface ContactMessageDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: Date;
}
