"use client";

import * as React from "react";
import { toast } from "sonner";

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
}

interface CommerceContextValue {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, "key">) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  cartReady: boolean;
  wishlist: string[];
  wishlistReady: boolean;
  toggleWishlist: (productId: string, name?: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const CommerceContext = React.createContext<CommerceContextValue | null>(null);
const CART_KEY = "labonno.cart.v1";
const WISHLIST_KEY = "labonno.wishlist.v1";

function lineKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [cartReady, setCartReady] = React.useState(false);
  const [wishlistReady, setWishlistReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart) as CartItem[]);
      const rawWish = window.localStorage.getItem(WISHLIST_KEY);
      if (rawWish) setWishlist(JSON.parse(rawWish) as string[]);
    } catch {
      // Corrupt local storage is not fatal — start with an empty bag.
    }
    setCartReady(true);
    setWishlistReady(true);
  }, []);

  React.useEffect(() => {
    if (!cartReady) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  React.useEffect(() => {
    if (!wishlistReady) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, wishlistReady]);

  // Reconcile a guest wishlist with the server copy once a session exists.
  React.useEffect(() => {
    let cancelled = false;
    async function sync() {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { productIds: string[] };
        if (cancelled) return;
        const local = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]") as string[];
        const merged = Array.from(new Set([...(data.productIds ?? []), ...local]));
        setWishlist(merged);
        for (const id of local) {
          if (!data.productIds?.includes(id)) {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: id }),
            });
          }
        }
      } catch {
        // Offline or guest — keep the local wishlist.
      }
    }
    sync();
    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart: CommerceContextValue["addToCart"] = (item) => {
    const key = lineKey(item.productId, item.size, item.color);
    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        const nextQty = Math.min(item.maxStock || 99, existing.quantity + item.quantity);
        return prev.map((line) => (line.key === key ? { ...line, quantity: nextQty } : line));
      }
      return [...prev, { ...item, key }];
    });
    toast.success("Added to bag", { description: `${item.name} · ${item.size} / ${item.color}` });
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key));
    toast("Removed from bag");
  };

  const updateQuantity = (key: string, quantity: number) => {
    setCart((prev) =>
      prev.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.max(1, Math.min(line.maxStock || 99, quantity)) }
          : line
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = async (productId: string, name?: string) => {
    const isRemoving = wishlist.includes(productId);
    setWishlist((prev) => (isRemoving ? prev.filter((id) => id !== productId) : [...prev, productId]));
    toast(isRemoving ? "Removed from wishlist" : "Saved to wishlist", name ? { description: name } : undefined);
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // Local state remains authoritative for guests.
    }
  };

  const value: CommerceContextValue = {
    cart,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartReady,
    wishlist,
    wishlistReady,
    toggleWishlist,
    isWishlisted: (id: string) => wishlist.includes(id),
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const ctx = React.useContext(CommerceContext);
  if (!ctx) throw new Error("useCommerce must be used inside CommerceProvider");
  return ctx;
}
