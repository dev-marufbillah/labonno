import type { Metadata } from "next";
import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth/server";
import { getOrdersForUser } from "@/lib/services/orders";
import { getWishlistIds } from "@/lib/services/wishlist";
import { formatMoney, formatDate } from "@/lib/utils/format";
import { ORDER_STATUS_LABELS } from "@/lib/config/site";
import { StatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await requireUser("/login?next=/account");
  const [orders, wishlist] = await Promise.all([getOrdersForUser(user.id), getWishlistIds(user.id)]);
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-light">Good to see you, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Manage your orders, details and saved pieces.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Orders", value: String(orders.length), href: "/account/orders", icon: Package },
          { label: "Total spent", value: formatMoney(spent), href: "/account/orders", icon: MapPin },
          { label: "Saved pieces", value: String(wishlist.length), href: "/wishlist", icon: Heart },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="card-surface group p-5 transition hover:border-gold">
            <card.icon className="size-4 text-ink-muted" strokeWidth={1.3} />
            <p className="mt-3 font-serif text-2xl">{card.value}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wide2 text-ink-muted">
              {card.label}
              <ArrowRight className="size-2.5 opacity-0 transition group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">Recent orders</h2>
          <Link href="/account/orders" className="text-[10px] uppercase tracking-label text-gold-dark underline underline-offset-4">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-line p-8 text-center">
            <p className="font-serif text-xl">No orders yet</p>
            <p className="mt-1 text-[12.5px] text-ink-muted">When you place an order it will appear here.</p>
            <Link href="/shop" className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {orders.slice(0, 4).map((order) => (
              <li key={String(order._id)} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <Link href={`/account/orders/${order._id}`} className="font-serif text-[15px] hover:text-gold-dark">
                    {order.orderNumber}
                  </Link>
                  <p className="text-[11px] text-ink-muted">
                    {formatDate(order.createdAt)} · {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={order.status} />
                  <span className="text-[13px]">{formatMoney(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-serif text-lg">Need help with an order?</p>
          <p className="text-[12px] text-ink-muted">Our studio answers Sunday–Thursday, 11am–7pm.</p>
        </div>
        <Link href="/contact" className="rounded-full border border-ink/25 px-6 py-2.5 text-[10px] uppercase tracking-label transition hover:bg-ink hover:text-cream">
          Contact us
        </Link>
      </section>
      <p className="sr-only">{ORDER_STATUS_LABELS[orders[0]?.status ?? "pending"]}</p>
    </div>
  );
}
