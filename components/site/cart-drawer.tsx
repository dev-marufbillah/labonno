"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Dialog } from "@radix-ui/react-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCommerce } from "./commerce-provider";
import { formatMoney } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { cart, subtotal, updateQuantity, removeFromCart, cartCount } = useCommerce();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-cream-50 shadow-luxe focus:outline-none">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <DialogPrimitive.Title className="font-serif text-xl">
              Shopping bag {cartCount > 0 && <span className="text-ink-muted">({cartCount})</span>}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Your selected items</DialogPrimitive.Description>
            <DialogPrimitive.Close aria-label="Close bag" className="p-1.5">
              <X className="size-5" strokeWidth={1.4} />
            </DialogPrimitive.Close>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <ShoppingBag className="size-8 text-ink-muted" strokeWidth={1.2} />
              <p className="font-serif text-2xl">Your bag is empty</p>
              <p className="text-[13px] text-ink-muted">Discover handcrafted pieces made in limited runs.</p>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link href="/shop">Explore the collection</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="divide-y divide-line/70">
                  {cart.map((line) => (
                    <li key={line.key} className="flex gap-3 py-4">
                      <Link href={`/products/${line.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-md bg-cream-200">
                        <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <Link href={`/products/${line.slug}`} className="truncate font-serif text-[15px]">
                            {line.name}
                          </Link>
                          <button
                            type="button"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => removeFromCart(line.key)}
                            className="-mr-1 -mt-1 p-1 text-ink-muted hover:text-red-700"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wide2 text-ink-muted">
                          {line.size} · {line.color}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-line">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(line.key, line.quantity - 1)}
                              className="grid size-7 place-items-center text-ink-muted hover:text-ink"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-6 text-center text-[12px]">{line.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(line.key, line.quantity + 1)}
                              className="grid size-7 place-items-center text-ink-muted hover:text-ink"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <span className="text-[13px]">{formatMoney(line.price * line.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-line px-5 py-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="uppercase tracking-wide2 text-ink-muted">Subtotal</span>
                  <span className="font-serif text-lg">{formatMoney(subtotal)}</span>
                </div>
                <p className="mt-1 text-[11px] text-ink-muted">Delivery and discounts calculated at checkout.</p>
                <div className="mt-4 grid gap-2">
                  <Button asChild onClick={() => onOpenChange(false)}>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                  <Button variant="outline" asChild onClick={() => onOpenChange(false)}>
                    <Link href="/cart">View bag</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
