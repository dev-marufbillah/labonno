import { z } from "zod";
import { DISTRICTS } from "@/lib/config/site";

const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => phoneRegex.test(v), "Enter a valid Bangladeshi mobile number (e.g. 01712345678)");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: phoneSchema.optional().or(z.literal("")),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const colorSchema = z.object({ name: z.string().min(1), hex: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i) });

export const variantSchema = z.object({
  sku: z.string().min(2, "SKU required"),
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().min(0).optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().trim().min(3, "Product name is required").max(140),
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  sku: z.string().trim().min(2, "SKU is required"),
  shortDescription: z.string().trim().min(10, "Add a short description").max(240),
  description: z.string().trim().min(20, "Add a full description"),
  category: z.string().min(1, "Choose a category"),
  collections: z.array(z.string()).default([]),
  images: z.array(z.string().min(1)).min(1, "Add at least one image"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  sizes: z.array(z.string().min(1)).min(1, "Add at least one size"),
  colors: z.array(colorSchema).min(1, "Add at least one colour"),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
  stock: z.coerce.number().int().min(0).default(0),
  material: z.string().optional().default(""),
  careInstructions: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
  seo: z
    .object({
      title: z.string().optional().default(""),
      description: z.string().optional().default(""),
      keywords: z.array(z.string()).optional().default([]),
    })
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  tagline: z.string().optional().default(""),
  description: z.string().optional().default(""),
  image: z.string().min(1, "Add a category image"),
  order: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  showOnHome: z.boolean().default(true),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  tagline: z.string().optional().default(""),
  description: z.string().optional().default(""),
  image: z.string().min(1, "Add a collection image"),
  order: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .transform((v) => v.toUpperCase()),
  description: z.string().optional().default(""),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1),
  minSubtotal: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  usageLimit: z.coerce.number().int().min(0).optional().nullable(),
  perUserLimit: z.coerce.number().int().min(0).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  active: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Full name is required").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone: phoneSchema,
  }),
  shippingAddress: z.object({
    address: z.string().trim().min(8, "Enter your full street address").max(300),
    area: z.string().trim().min(2, "Enter your area or thana").max(120),
    district: z.enum(DISTRICTS, { errorMap: () => ({ message: "Select your district" }) }),
    postcode: z.string().trim().max(10).optional().or(z.literal("")),
    note: z.string().trim().max(300).optional().or(z.literal("")),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        color: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .min(1, "Your bag is empty"),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "sslcommerz"]),
  couponCode: z.string().trim().optional().nullable(),
  paymentReference: z
    .object({
      transactionId: z.string().trim().min(4, "Enter the transaction ID").optional(),
      senderNumber: phoneSchema.optional(),
    })
    .optional()
    .nullable(),
  createAccount: z.boolean().optional().default(false),
  password: z.string().min(8).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Add a short title").max(90),
  body: z.string().trim().min(10, "Tell us a little more").max(1200),
  author: z.string().trim().min(2).max(60),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Your name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: phoneSchema.optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(10, "Please write your message").max(2000),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(4, "Order number is required"),
  phone: phoneSchema,
});

export const pageSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  title: z.string().trim().min(2),
  excerpt: z.string().optional().default(""),
  content: z.string().min(10, "Add page content"),
  published: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
});

export const bannerSchema = z.object({
  placement: z.enum(["home_hero", "promo", "category", "popup"]),
  title: z.string().trim().min(2),
  subtitle: z.string().optional().default(""),
  eyebrow: z.string().optional().default(""),
  image: z.string().min(1, "Add a banner image"),
  mobileImage: z.string().optional().default(""),
  ctaLabel: z.string().optional().default(""),
  ctaHref: z.string().optional().default(""),
  align: z.enum(["left", "center", "right"]).default("left"),
  order: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const sectionSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().optional().default(""),
  visible: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
  data: z.record(z.unknown()).default({}),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  phone: phoneSchema.optional().or(z.literal("")),
});

export const addressSchema = z.object({
  address: z.string().trim().min(8),
  area: z.string().trim().min(2),
  district: z.enum(DISTRICTS),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type PageInput = z.infer<typeof pageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
