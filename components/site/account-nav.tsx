"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { SignOutButton } from "./sign-out-button";

const LINKS = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Reviews", href: "/account/reviews" },
  { label: "Profile", href: "/account/profile" },
  { label: "Wishlist", href: "/wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:border-0 lg:pb-0" aria-label="Account">
      {LINKS.map((link) => {
        const active = pathname === link.href || (link.href !== "/account" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[11px] uppercase tracking-wide2 transition lg:rounded-md lg:px-3",
              active ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-200/60"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
