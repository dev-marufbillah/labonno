"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  LayoutDashboard,
  LogOut,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCommerce } from "./commerce-provider";
import { CartDrawer } from "./cart-drawer";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface NavItem {
  label: string;
  href: string;
  children: { label: string; href: string }[];
}

export function HeaderClient({
  navigation,
  announcement,
  brandName,
  tagline,
  logoImage,
  user,
}: {
  navigation: NavItem[];
  announcement: string;
  brandName: string;
  tagline: string;
  logoImage?: string;
  user: { id: string; name: string; email: string; role: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist } = useCommerce();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const signOut = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <div className="border-b border-line/70 bg-cream-100">
        <p className="shell py-2 text-center text-[9.5px] uppercase tracking-label text-ink-soft sm:text-[10px]">
          {announcement}
        </p>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-line/70 bg-cream/95 backdrop-blur transition-shadow",
          scrolled && "shadow-[0_8px_24px_-20px_rgba(28,27,24,0.5)]"
        )}
      >
        <div className="shell relative flex h-[62px] items-center justify-between gap-4 md:h-[76px]">
          <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Primary">
            {navigation.slice(0, 4).map((item) => (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-[11px] uppercase tracking-wide2 text-ink-soft transition hover:text-ink",
                    pathname === item.href && "text-ink"
                  )}
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDown className="size-3" strokeWidth={1.5} />}
                </Link>
                {item.children.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-40 w-56 translate-y-1 pt-5 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="rounded-lg border border-line bg-cream-50 p-2 shadow-luxe">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-md px-3 py-2 text-[12px] text-ink-soft transition hover:bg-cream-200/60 hover:text-ink"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="tap-target -ml-1 grid place-items-center p-2 lg:hidden"
          >
            <Menu className="size-5" strokeWidth={1.4} />
          </button>

          <Link href="/" className="flex flex-col items-center leading-none" aria-label={`${brandName} home`}>
            {logoImage ? (
              <>
                <Image
                  src={logoImage}
                  alt={brandName}
                  width={180}
                  height={44}
                  priority
                  className="h-8 w-auto object-contain md:h-10"
                />
                <span className="mt-1 hidden text-[7.5px] uppercase tracking-[0.4em] text-ink-muted md:block">{tagline}</span>
              </>
            ) : (
              <>
                <span className="font-serif text-[22px] tracking-[0.16em] text-ink md:text-[26px]">{brandName}</span>
                <span className="mt-1 hidden text-[7.5px] uppercase tracking-[0.4em] text-ink-muted md:block">{tagline}</span>
              </>
            )}
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="tap-target grid place-items-center p-2">
              <Search className="size-[18px]" strokeWidth={1.4} />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="tap-target relative hidden place-items-center p-2 sm:grid">
              <Heart className="size-[18px]" strokeWidth={1.4} />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 top-1 grid size-4 place-items-center rounded-full bg-gold text-[9px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                type="button"
                aria-label="Account"
                onClick={() => (user ? setAccountOpen((v) => !v) : router.push("/login"))}
                className="p-2"
              >
                <User className="size-[18px]" strokeWidth={1.4} />
              </button>
              {user && accountOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-cream-50 p-2 shadow-luxe">
                    <div className="border-b border-line/70 px-3 py-2">
                      <p className="truncate font-serif text-[15px]">{user.name}</p>
                      <p className="truncate text-[11px] text-ink-muted">{user.email}</p>
                    </div>
                    {(user.role === "admin" || user.role === "super_admin") && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] text-ink-soft hover:bg-cream-200/60"
                      >
                        <LayoutDashboard className="size-3.5" /> Admin dashboard
                      </Link>
                    )}
                    <Link href="/account" className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] text-ink-soft hover:bg-cream-200/60">
                      <User className="size-3.5" /> My account
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] text-ink-soft hover:bg-cream-200/60">
                      <Package className="size-3.5" /> My orders
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="size-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
            <button type="button" aria-label="Open bag" onClick={() => setCartOpen(true)} className="tap-target relative grid place-items-center p-2">
              <ShoppingBag className="size-[18px]" strokeWidth={1.4} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 top-1 grid size-4 place-items-center rounded-full bg-ink text-[9px] text-cream">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream-50 shadow-luxe animate-fade-in">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              {logoImage ? (
                <Image src={logoImage} alt={brandName} width={140} height={36} className="h-8 w-auto object-contain" />
              ) : (
                <span className="font-serif text-xl tracking-[0.16em]">{brandName}</span>
              )}
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-1.5">
                <X className="size-5" strokeWidth={1.4} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
              {navigation.map((item) => (
                <div key={item.label} className="border-b border-line/70 py-3">
                  <Link href={item.href} className="font-serif text-lg text-ink">
                    {item.label}
                  </Link>
                  {item.children.length > 0 && (
                    <div className="mt-2 space-y-1.5 pl-1">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} className="block text-[12.5px] text-ink-muted">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-6 space-y-2 text-[13px]">
                <Link href="/wishlist" className="tap-target flex items-center py-2.5">Wishlist</Link>
                <Link href="/cart" className="tap-target flex items-center py-2.5">Shopping bag</Link>
                <Link href="/track-order" className="tap-target flex items-center py-2.5">Track order</Link>
                {user ? (
                  <>
                    <Link href="/account" className="tap-target flex items-center py-2.5">My account</Link>
                    <button type="button" onClick={signOut} className="tap-target flex items-center py-2.5 text-left text-red-700">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="tap-target flex items-center py-2.5 font-medium">Sign in</Link>
                    <Link href="/register" className="tap-target flex items-center py-2.5 text-gold-dark">Create account</Link>
                  </>
                )}
              </div>
            </nav>
            <div className="border-t border-line px-5 py-3 text-[10px] uppercase tracking-label text-ink-muted">
              Handcrafted in Dhaka
            </div>
          </div>
        </div>
      )}

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent title="Search Labonno" description="Find sarees, three-piece sets, dresses and accessories." className="max-w-xl">
          <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-line pb-2">
            <Search className="size-4 text-ink-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category or SKU"
              className="h-10 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-muted/70"
            />
            <button type="submit" className="text-[10px] uppercase tracking-label text-gold-dark">
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Saree", "Three piece", "Dresses", "Tops", "Bags", "Velvet"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  router.push(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="rounded-full border border-line px-3 py-1 text-[10.5px] uppercase tracking-wide2 text-ink-muted transition hover:border-ink hover:text-ink"
              >
                {term}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
