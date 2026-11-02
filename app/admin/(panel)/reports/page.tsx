import type { Metadata } from "next";
import { getSalesReport } from "@/lib/services/reports";
import { AdminPageTitle, Panel, StatCard, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sales reports" };

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const range = defaultRange();
  const from = params.from ? new Date(params.from) : new Date(range.from);
  const to = params.to ? new Date(`${params.to}T23:59:59`) : new Date(`${range.to}T23:59:59`);
  const report = await getSalesReport(from, to);

  return (
    <div>
      <AdminPageTitle
        title="Sales reports"
        description={`${formatDate(from)} → ${formatDate(to)}`}
        action={
          <form action="/admin/reports" className="flex flex-wrap items-center gap-2">
            <input type="date" name="from" defaultValue={from.toISOString().slice(0, 10)} className="h-9 rounded-md border border-line bg-white/70 px-2 text-[12px]" />
            <span className="text-ink-muted">→</span>
            <input type="date" name="to" defaultValue={to.toISOString().slice(0, 10)} className="h-9 rounded-md border border-line bg-white/70 px-2 text-[12px]" />
            <button type="submit" className="h-9 rounded-md bg-ink px-4 text-[10px] uppercase tracking-label text-cream">Apply</button>
          </form>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(report.revenue)} tone="positive" />
        <StatCard label="Orders" value={String(report.orders.length)} />
        <StatCard label="Average order" value={formatMoney(report.orders.length ? Math.round(report.revenue / report.orders.length) : 0)} />
        <StatCard label="Top product" value={report.topProducts[0]?.name.slice(0, 18) ?? "—"} hint={report.topProducts[0] ? `${report.topProducts[0].qty} units` : undefined} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Orders in range">
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Date</TH>
                <TH>Customer</TH>
                <TH>Payment</TH>
                <TH>Total</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <tbody>
              {report.orders.map((order) => (
                <TR key={String(order._id)}>
                  <TD>{order.orderNumber}</TD>
                  <TD>{formatDate(order.createdAt)}</TD>
                  <TD className="max-w-[140px] truncate">{order.customer.name}</TD>
                  <TD>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</TD>
                  <TD>{formatMoney(order.total)}</TD>
                  <TD><StatusBadge value={order.status} /></TD>
                </TR>
              ))}
              {report.orders.length === 0 ? <TableEmpty colSpan={6} message="No orders in this period." /> : null}
            </tbody>
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Best performing pieces">
            <ul className="space-y-2.5">
              {report.topProducts.map((product) => (
                <li key={product.name} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12.5px] text-ink">{product.name}</span>
                  <span className="shrink-0 text-[11.5px] text-ink-muted">{product.qty} · {formatMoney(product.revenue)}</span>
                </li>
              ))}
              {report.topProducts.length === 0 ? <li className="text-[12px] text-ink-muted">No sales recorded.</li> : null}
            </ul>
          </Panel>
          <Panel title="Revenue by payment method">
            <ul className="space-y-2">
              {Object.entries(report.byPayment).map(([method, total]) => (
                <li key={method} className="flex justify-between text-[12.5px]">
                  <span className="text-ink-soft">{PAYMENT_METHOD_LABELS[method] ?? method}</span>
                  <span>{formatMoney(total)}</span>
                </li>
              ))}
              {Object.keys(report.byPayment).length === 0 ? <li className="text-[12px] text-ink-muted">No payments in this period.</li> : null}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
