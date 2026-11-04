import "server-only";
import { ObjectId, type Filter } from "mongodb";
import { col } from "@/lib/db/mongo";
import type {
  CouponDoc,
  OrderDoc,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SiteSettingsDoc,
} from "@/lib/db/types";
import { getProductById } from "./products";
import { computeTotals, evaluateCoupon, priceLine, type PricedLine } from "./pricing";

export interface CreateOrderInput {
  items: { productId: string; size: string; color: string; quantity: number }[];
  customer: { name: string; email: string; phone: string };
  shippingAddress: { address: string; area: string; district: string; postcode?: string; note?: string };
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  paymentReference?: { transactionId?: string; senderNumber?: string } | null;
  userId?: string | null;
  deliveryCharge: number;
  settings: SiteSettingsDoc;
}

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LBN-${y}${m}${d}-${rand}`;
}

async function restoreStock(lines: { productId: string; size: string; color: string; quantity: number }[]) {
  for (const line of lines) {
    if (!ObjectId.isValid(line.productId)) continue;
    await col("products").updateOne(
      { _id: new ObjectId(line.productId), "variants.size": line.size, "variants.color": line.color },
      {
        $inc: { "variants.$.stock": line.quantity, stock: line.quantity },
        $set: { updatedAt: new Date() },
      }
    );
  }
}

/**
 * Creates an order with server-verified prices, stock and coupon rules.
 * MongoDB standalone deployments cannot use multi-document transactions, so stock
 * is reserved with conditional atomic updates and compensated on failure.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderDoc> {
  if (!input.items.length) throw new OrderError("Your bag is empty.");

  const pricedLines: PricedLine[] = [];
  for (const item of input.items) {
    const product = await getProductById(item.productId);
    if (!product || product.status !== "published") {
      throw new OrderError("One of the items is no longer available.");
    }
    const line = priceLine(product, item.size, item.color, item.quantity);
    if (line.availableStock < line.quantity) {
      throw new OrderError(`${product.name} (${item.size}) has only ${line.availableStock} in stock.`);
    }
    pricedLines.push(line);
  }

  let coupon: CouponDoc | null = null;
  if (input.couponCode) {
    coupon = await col<CouponDoc>("coupons").findOne({ code: input.couponCode.toUpperCase().trim() });
    if (!coupon) throw new OrderError("Coupon code is not valid.");
  }
  const couponEvaluation = coupon ? evaluateCoupon(coupon, pricedLines.reduce((s, l) => s + l.lineTotal, 0)) : null;
  if (couponEvaluation && !couponEvaluation.valid) throw new OrderError(couponEvaluation.message);

  const totals = computeTotals({
    lines: pricedLines,
    couponEvaluation,
    deliveryCharge: input.deliveryCharge,
    settings: input.settings,
  });

  const items: OrderItem[] = pricedLines.map((line) => ({
    productId: String(line.product._id),
    name: line.product.name,
    slug: line.product.slug,
    image: line.product.images[0] ?? "",
    sku: line.product.variants.find((v) => v.size === line.size && v.color === line.color)?.sku ?? line.product.sku,
    size: line.size,
    color: line.color,
    price: line.unitPrice,
    quantity: line.quantity,
    lineTotal: line.lineTotal,
  }));

  const now = new Date();
  const isManual = input.paymentMethod === "bkash" || input.paymentMethod === "nagad";
  const paymentStatus: PaymentStatus =
    input.paymentMethod === "cod" ? "unpaid" : isManual ? "pending_verification" : "unpaid";

  const order: OrderDoc = {
    orderNumber: generateOrderNumber(),
    userId: input.userId ?? null,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    deliveryCharge: totals.deliveryCharge,
    total: totals.total,
    coupon: coupon ? { code: coupon.code, type: coupon.type, value: coupon.value } : null,
    paymentMethod: input.paymentMethod,
    paymentStatus,
    paymentRef: isManual
      ? {
          provider: input.paymentMethod,
          transactionId: input.paymentReference?.transactionId,
          senderNumber: input.paymentReference?.senderNumber,
        }
      : { provider: input.paymentMethod },
    status: "pending",
    statusHistory: [{ status: "pending", note: "Order placed", at: now }],
    customerNote: input.shippingAddress.note,
    inventoryApplied: false,
    createdAt: now,
    updatedAt: now,
  };

  const ordersCol = col<OrderDoc>("orders");
  const { insertedId } = await ordersCol.insertOne(order);
  const reserved: typeof input.items = [];

  for (const line of pricedLines) {
    const productId = String(line.product._id);
    const res = await col("products").updateOne(
      {
        _id: new ObjectId(productId),
        variants: { $elemMatch: { size: line.size, color: line.color, stock: { $gte: line.quantity } } },
      },
      {
        $inc: { "variants.$.stock": -line.quantity, stock: -line.quantity, soldCount: line.quantity },
        $set: { updatedAt: new Date() },
      }
    );
    if (res.modifiedCount !== 1) {
      await restoreStock(reserved);
      await ordersCol.deleteOne({ _id: insertedId });
      throw new OrderError(`Stock for ${line.product.name} (${line.size}) changed. Please review your bag.`, 409);
    }
    reserved.push({ productId, size: line.size, color: line.color, quantity: line.quantity });
    await col("inventory_logs").insertOne({
      productId,
      productName: line.product.name,
      sku: items.find((i) => i.productId === productId && i.size === line.size)?.sku ?? line.product.sku,
      change: -line.quantity,
      previousStock: line.availableStock,
      newStock: line.availableStock - line.quantity,
      reason: "order.reserve",
      orderNumber: order.orderNumber,
      actor: input.customer.email,
      createdAt: now,
    });
  }

  if (coupon) {
    await col<CouponDoc>("coupons").updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  }

  await ordersCol.updateOne({ _id: insertedId }, { $set: { inventoryApplied: true } });

  return { ...order, _id: insertedId, inventoryApplied: true };
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderDoc | null> {
  return col<OrderDoc>("orders").findOne({ orderNumber });
}

export async function getOrderById(id: string): Promise<OrderDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  return col<OrderDoc>("orders").findOne({ _id: new ObjectId(id) });
}

export async function getOrdersForUser(userId: string): Promise<OrderDoc[]> {
  return col<OrderDoc>("orders").find({ userId }).sort({ createdAt: -1 }).toArray();
}

/** Ownership check: a customer may only ever read their own order. */
export async function getOrderForUser(orderId: string, userId: string): Promise<OrderDoc | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;
  if (order.userId !== userId) return null;
  return order;
}

export async function getOrderForTracking(orderNumber: string, phone: string): Promise<OrderDoc | null> {
  const order = await getOrderByNumber(orderNumber.trim().toUpperCase());
  if (!order) return null;
  const normalise = (v: string) => v.replace(/\D/g, "").slice(-11);
  if (normalise(order.customer.phone) !== normalise(phone)) return null;
  return order;
}

export async function listOrders(opts: {
  status?: OrderStatus | "all";
  search?: string;
  page?: number;
  perPage?: number;
  paymentStatus?: PaymentStatus | "all";
}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, opts.perPage ?? 20);
  const filter: Filter<OrderDoc> = {};
  if (opts.status && opts.status !== "all") filter.status = opts.status;
  if (opts.paymentStatus && opts.paymentStatus !== "all") filter.paymentStatus = opts.paymentStatus;
  if (opts.search) {
    const rx = new RegExp(opts.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ orderNumber: rx }, { "customer.name": rx }, { "customer.phone": rx }, { "customer.email": rx }];
  }
  const ordersCol = col<OrderDoc>("orders");
  const [orders, total] = await Promise.all([
    ordersCol.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).toArray(),
    ordersCol.countDocuments(filter),
  ]);
  return { orders, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
  actor?: string
): Promise<{ ok: boolean; message: string }> {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === status) return { ok: false, message: `Order is already ${status}.` };
  if (!TRANSITIONS[order.status].includes(status)) {
    return { ok: false, message: `Cannot move an order from ${order.status} to ${status}.` };
  }

  const updates: Partial<OrderDoc> = { status, updatedAt: new Date() };
  if (status === "delivered" && order.paymentStatus === "unpaid") {
    updates.paymentStatus = "paid";
  }

  await col<OrderDoc>("orders").updateOne(
    { _id: order._id },
    {
      $set: updates,
      $push: { statusHistory: { status, note: note || `Status updated to ${status}`, at: new Date(), by: actor } },
    }
  );

  if ((status === "cancelled" || status === "returned") && order.inventoryApplied) {
    await restoreStock(
      order.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity }))
    );
    for (const item of order.items) {
      await col("inventory_logs").insertOne({
        productId: item.productId,
        productName: item.name,
        sku: item.sku,
        change: item.quantity,
        previousStock: 0,
        newStock: 0,
        reason: status === "cancelled" ? "order.cancel.restock" : "order.return.restock",
        orderNumber: order.orderNumber,
        actor,
        createdAt: new Date(),
      });
    }
    await col<OrderDoc>("orders").updateOne({ _id: order._id }, { $set: { inventoryApplied: false } });
  }

  return { ok: true, message: `Order marked as ${status}.` };
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  actor?: string,
  /** Gateway proof (transaction id, provider, paid time) recorded with the payment. */
  reference?: { provider: string; transactionId?: string; gatewayRef?: string; senderNumber?: string; paidAt?: Date } | null
): Promise<{ ok: boolean; message: string }> {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  await col<OrderDoc>("orders").updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus,
        updatedAt: new Date(),
        ...(reference ? { paymentRef: { ...(order.paymentRef ?? {}), ...reference } } : {}),
        ...(paymentStatus === "paid" ? { "paymentRef.paidAt": reference?.paidAt ?? new Date() } : {}),
      },
      $push: {
        statusHistory: {
          status: order.status,
          note: `Payment marked ${paymentStatus} by ${actor ?? "system"}`,
          at: new Date(),
          by: actor,
        },
      },
    }
  );
  return { ok: true, message: `Payment marked as ${paymentStatus}.` };
}

/** Customers may cancel only while an order has not been handed to logistics. */
export async function cancelOrderByCustomer(orderId: string, userId: string) {
  const order = await getOrderForUser(orderId, userId);
  if (!order) return { ok: false, message: "Order not found." };
  if (!["pending", "confirmed"].includes(order.status)) {
    return { ok: false, message: "This order can no longer be cancelled. Please contact our studio." };
  }
  return updateOrderStatus(orderId, "cancelled", "Cancelled by customer", "customer");
}
