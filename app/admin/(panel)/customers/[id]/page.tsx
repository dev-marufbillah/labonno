import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/services/customers";
import { AdminPageTitle, Panel, StatCard } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Customer details" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCustomerDetail(id);
  if (!detail) notFound();

  return (
    <div>
      <AdminPageTitle title={detail.user.name} description={detail.user.email} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Orders" value={String(detail.orders.length)} />
        <StatCard label="Lifetime value" value={formatMoney(detail.spent)} tone="positive" />
        <StatCard label="Customer since" value={formatDate(detail.user.createdAt)} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.6fr]">
        <Panel title="Profile">
          <dl className="space-y-2 text-[12.5px]">
            <div className="flex justify-between gap-3"><dt className="text-ink-muted">Email</dt><dd className="truncate">{detail.user.email}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-muted">Phone</dt><dd>{detail.user.phone ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-muted">Role</dt><dd className="capitalize">{detail.user.role.replace("_", " ")}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-muted">Verified</dt><dd>{detail.user.emailVerified ? "Yes" : "No"}</dd></div>
          </dl>
        </Panel>

        <Panel title="Order history">
          {detail.orders.length === 0 ? (
            <p className="text-[12.5px] text-ink-muted">This customer has not placed an order yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {detail.orders.map((order) => (
                <li key={String(order._id)} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <Link href={`/admin/orders/${order._id}`} className="text-[12.5px] font-medium text-ink hover:text-gold-dark">
                      {order.orderNumber}
                    </Link>
                    <p className="text-[10.5px] text-ink-muted">{formatDate(order.createdAt)} · {order.items.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={order.status} />
                    <span className="text-[12px]">{formatMoney(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
