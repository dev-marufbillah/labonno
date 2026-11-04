export const SITE = {
  name: "LABONNO",
  nameBn: "লাবণ্য",
  tagline: "The Art of Elegance",
  description:
    "LABONNO is a Bangladeshi luxury fashion house creating handcrafted sarees, three-piece sets, dresses and accessories for women who dress with intention.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_BD",
  currency: "BDT",
  currencySymbol: "৳",
  email: "hello@labonno.com",
  phone: "+880 1700 000 000",
  address: "House 27, Road 11, Banani, Dhaka 1213, Bangladesh",
} as const;

export const DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Gazipur",
  "Narayanganj",
  "Bogura",
  "Jashore",
  "Cox's Bazar",
  "Dinajpur",
  "Pabna",
  "Kushtia",
  "Noakhali",
  "Tangail",
  "Faridpur",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  pending_verification: "Pending verification",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  sslcommerz: "Card / SSLCommerz",
};

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Everything", href: "/admin/site", icon: "PanelsTopLeft" },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingBag" },
  { label: "Products", href: "/admin/products", icon: "Package" },
  { label: "Inventory", href: "/admin/inventory", icon: "Boxes" },
  { label: "Categories", href: "/admin/categories", icon: "FolderTree" },
  { label: "Collections", href: "/admin/collections", icon: "Layers" },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "Discounts", href: "/admin/coupons", icon: "TicketPercent" },
  { label: "Reviews", href: "/admin/reviews", icon: "Star" },
  { label: "Reports", href: "/admin/reports", icon: "BarChart3" },
] as const;

export const ADMIN_CONTENT_NAV = [
  { label: "Homepage", href: "/admin/homepage", icon: "PanelsTopLeft" },
  { label: "Banners", href: "/admin/banners", icon: "Images" },
  { label: "Pages", href: "/admin/pages", icon: "FileText" },
  { label: "Navigation", href: "/admin/navigation", icon: "Menu" },
  { label: "Media library", href: "/admin/media", icon: "ImageIcon" },
] as const;

export const ADMIN_SETTINGS_NAV = [
  { label: "General", href: "/admin/settings/general", icon: "Settings" },
  { label: "Appearance", href: "/admin/settings/appearance", icon: "Palette" },
  { label: "Payments", href: "/admin/settings/payments", icon: "CreditCard" },
  { label: "Shipping", href: "/admin/settings/shipping", icon: "Truck" },
  { label: "Admin users", href: "/admin/users", icon: "ShieldCheck" },
] as const;
