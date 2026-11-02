"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCommerce } from "./commerce-provider";
import { formatMoney } from "@/lib/utils/format";
import { EmptyState } from "@/components/site/empty-state";

export function CartView({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { cart, cartReady, subtotal, updateQuantity, removeFromCart } = useCommerce();

  if (!cartReady) {
    return (
      <div className="shell py-16">
        <div className="h-40 animate-pulse rounded-lg bg-cream-200/60" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="shell py-10">
        <EmptyState
          icon={<ShoppingBag className="size-7" strokeWidth={1.2} />}
          title="Your bag is empty"
          description="Explore the collection and add the pieces you love — we hold them for 60 minutes."
          actionLabel="Explore the collection"
          actionHref="/shop"
        />
      </div>
    );
  }

  const remaining = freeShippingThreshold - subtotal;

  return (
    <div className="shell grid gap-10 py-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      <div>
        <div className="hidden border-b border-line pb-3 text-[10px] uppercase tracking-wide2 text-ink-muted sm:grid sm:grid-cols-[1fr_120px_120px]">
          <span>Item</span>
          <span className="text-center">Quantity</span>
          <span className="text-right">Total</span>
        </div>
        <ul className="divide-y divide-line">
          {cart.map((line) => (
            <li key={line.key} className="grid gap-4 py-5 sm:grid-cols-[1fr_120px_120px] sm:items-center">
              <div className="flex gap-4">
                <Link href={`/products/${line.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-md bg-cream-200">
                  <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link href={`/products/${line.slug}`} className="font-serif text-[16px] hover:text-gold-dark">
                    {line.name}
                  </Link>
                  <p className="mt-1 text-[11px] uppercase tracking-wide2 text-ink-muted">
                    {line.size} · {line.color}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-soft">{formatMoney(line.price)}</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.key)}
                    className="mt-2 flex items-center gap-1 text-[10.5px] uppercase tracking-wide2 text-ink-muted transition hover:text-red-700"
                  >
                    <X className="size-3" /> Remove
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:justify-center">
                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(line.key, line.quantity - 1)}
                    className="grid size-8 place-items-center text-ink-muted hover:text-ink"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-7 text-center text-[12px]">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(line.key, line.quantity + 1)}
                    className="grid size-8 place-items-center text-ink-muted hover:text-ink"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>
              <p className="text-[13px] sm:text-right">{formatMoney(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between">
          <Link href="/shop" className="text-[10.5px] uppercase tracking-label text-ink-soft underline underline-offset-4 hover:text-ink">
            Continue shopping
          </Link>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-cream-50 p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Order summary</h2>
        {remaining > 0 ? (
          <p className="mt-2 rounded-md bg-cream-200/60 px-3 py-2 text-[11.5px] text-ink-soft">
            Add {formatMoney(remaining)} more for free delivery across Bangladesh.
          </p>
        ) : (
          <p className="mt-2 rounded-md bg-emerald-700/10 px-3 py-2 text-[11.5px] text-emerald-800">
            You have qualified for free delivery.
          </p>
        )}
        <dl className="mt-5 space-y-3 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery</dt>
            <dd className="text-ink-muted">Calculated at checkout</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 font-serif text-lg">
            <dt>Total</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft"
        >
          Proceed to checkout <ArrowRight className="size-3" />
        </Link>
        <p className="mt-3 text-center text-[10.5px] text-ink-muted">
          Cash on delivery · bKash · Nagad · SSLCommerz
        </p>
      </aside>
    </div>
  );
}
