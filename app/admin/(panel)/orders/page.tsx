import type { Metadata } from "next";
import Link from "next/link";
import { listOrders } from "@/lib/services/orders";
import { AdminPageTitle, AdminSearch, PaginationBar, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from "@/lib/config/site";
import type { OrderStatus } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Orders" };

const TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "all") as OrderStatus | "all";
  const page = Number(params.page ?? 1) || 1;
  const result = await listOrders({ status, search: params.q, page, perPage: 20 });

  return (
    <div>
      <AdminPageTitle title="Orders" description={`${result.total} orders`} />

      <Panel>
        <div className="mb-4 space-y-3">
          <AdminSearch action="/admin/orders" placeholder="Search order number, name, phone" defaultValue={params.q} />
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.value}
                href={`/admin/orders${tab.value === "all" ? "" : `?status=${tab.value}`}`}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-wide2 transition ${
                  status === tab.value ? "bg-ink text-cream" : "bg-cream-200/60 text-ink-soft hover:bg-cream-200"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Order</TH>
              <TH>Customer</TH>
              <TH>Items</TH>
              <TH>Total</TH>
              <TH>Payment</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <tbody>
            {result.orders.map((order) => (
              <TR key={String(order._id)}>
                <TD>
                  <Link href={`/admin/orders/${order._id}`} className="font-medium text-ink hover:text-gold-dark">
                    {order.orderNumber}
                  </Link>
                  <p className="text-[10px] text-ink-muted">{formatDate(order.createdAt)}</p>
                </TD>
                <TD>
                  <p>{order.customer.name}</p>
                  <p className="text-[10px] text-ink-muted">{order.customer.phone}</p>
                </TD>
                <TD>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TD>
                <TD>{formatMoney(order.total)}</TD>
                <TD>
                  <p className="text-[11px]">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                  <StatusBadge value={order.paymentStatus} kind="payment" />
                </TD>
                <TD><StatusBadge value={order.status} /></TD>
                <TD className="text-right">
                  <Link href={`/admin/orders/${order._id}`} className="rounded-full border border-line px-3 py-2 text-[10px] uppercase tracking-wide2 hover:border-ink">
                    Manage
                  </Link>
                </TD>
              </TR>
            ))}
            {result.orders.length === 0 ? (
              <TableEmpty colSpan={7} message={`No ${status === "all" ? "" : ORDER_STATUS_LABELS[status] ?? status} orders found.`} />
            ) : null}
          </tbody>
        </Table>

        <PaginationBar page={result.page} totalPages={result.totalPages} basePath="/admin/orders" params={{ q: params.q, status: params.status }} />
      </Panel>
    </div>
  );
}
