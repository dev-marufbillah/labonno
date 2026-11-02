"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  FolderTree,
  Layers,
  Users,
  TicketPercent,
  Star,
  BarChart3,
  PanelsTopLeft,
  Images,
  FileText,
  Menu,
  ImageIcon,
  Settings,
  Palette,
  CreditCard,
  Truck,
  ShieldCheck,
  X,
  LogOut,
  Store,
  UserCog,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  FolderTree,
  Layers,
  Users,
  TicketPercent,
  Star,
  BarChart3,
  PanelsTopLeft,
  Images,
  FileText,
  Menu,
  ImageIcon,
  Settings,
  Palette,
  CreditCard,
  Truck,
  ShieldCheck,
};

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
}

export function AdminShell({
  children,
  user,
  groups,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
  groups: { title: string; items: AdminNavItem[] }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col bg-footer text-cream/75">
      <div className="border-b border-cream/10 px-5 py-5">
        <Link href="/admin/dashboard" className="block">
          <span className="font-serif text-xl tracking-[0.18em] text-cream">LABONNO</span>
          <span className="mt-1 block text-[8px] uppercase tracking-[0.35em] text-cream/40">Studio admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4" aria-label="Admin">
        {groups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[8.5px] uppercase tracking-[0.22em] text-cream/35">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-[12.5px] transition",
                        isActive(item.href)
                          ? "bg-cream/10 text-cream"
                          : "text-cream/65 hover:bg-cream/5 hover:text-cream"
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-cream/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] text-cream/60 transition hover:bg-cream/5 hover:text-cream"
        >
          <Store className="size-3.5" strokeWidth={1.5} /> View storefront
        </Link>
        <Link
          href="/admin/profile"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] text-cream/60 transition hover:bg-cream/5 hover:text-cream"
        >
          <UserCog className="size-3.5" strokeWidth={1.5} /> My profile
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-cream/60 transition hover:bg-cream/5 hover:text-cream"
        >
          <LogOut className="size-3.5" strokeWidth={1.5} /> Sign out
        </button>
      </div>
    </div>
  );

  const crumbs = pathname.split("/").filter(Boolean).slice(1);
  const title = crumbs.length
    ? crumbs[crumbs.length - 1].replace(/-/g, " ").replace(/\[|\]/g, "")
    : "Dashboard";

  return (
    <div className="min-h-screen bg-[#F6F2EB]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-64 animate-fade-in">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 z-10 text-cream/70"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-[#FAF7F2]/95 px-4 backdrop-blur md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="lg:hidden">
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide2 text-ink-muted">
              <Link href="/admin/dashboard" className="hover:text-ink">Admin</Link>
              {crumbs.map((crumb, index) => (
                <span key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3" />
                  <span className={index === crumbs.length - 1 ? "truncate capitalize text-ink" : "capitalize"}>
                    {crumb.replace(/-/g, " ")}
                  </span>
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] leading-tight text-ink">{user.name}</p>
              <p className="text-[9.5px] uppercase tracking-wide2 text-ink-muted">{user.role.replace("_", " ")}</p>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-ink text-[12px] text-cream">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-7 md:py-8">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
