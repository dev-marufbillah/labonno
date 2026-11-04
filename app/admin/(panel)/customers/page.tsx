import type { Metadata } from "next";
import Link from "next/link";
import { listCustomers } from "@/lib/services/customers";
import { AdminPageTitle, AdminSearch, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { requireAdmin } from "@/lib/auth/server";
import { DeleteStaffButton } from "@/components/admin/staff-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const actor = await requireAdmin();
  const customers = await listCustomers(params.q);

  return (
    <div>
      <AdminPageTitle title="Customers" description={`${customers.length} customer accounts`} />
      <Panel>
        <div className="mb-4">
          <AdminSearch action="/admin/customers" placeholder="Search name, email or phone" defaultValue={params.q} />
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Customer</TH>
              <TH>Contact</TH>
              <TH>Orders</TH>
              <TH>Spent</TH>
              <TH>Joined</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <tbody>
            {customers.map((customer) => (
              <TR key={customer.id}>
                <TD>
                  <Link href={`/admin/customers/${customer.id}`} className="font-medium text-ink hover:text-gold-dark">
                    {customer.name}
                  </Link>
                  <div className="mt-1 flex gap-1">
                    {customer.emailVerified ? <Badge tone="green">Verified</Badge> : <Badge>Unverified</Badge>}
                  </div>
                </TD>
                <TD>
                  <p className="text-[12px]">{customer.email}</p>
                  <p className="text-[10.5px] text-ink-muted">{customer.phone ?? "—"}</p>
                </TD>
                <TD>{customer.orderCount}</TD>
                <TD>{formatMoney(customer.spent)}</TD>
                <TD>{formatDate(customer.createdAt)}</TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/customers/${customer.id}`} className="rounded-full border border-line px-3 py-2 text-[10px] uppercase tracking-wide2 hover:border-ink">
                      View
                    </Link>
                    {actor.role === "super_admin" ? (
                      <DeleteStaffButton userId={customer.id} email={customer.email} />
                    ) : null}
                  </div>
                </TD>
              </TR>
            ))}
            {customers.length === 0 ? <TableEmpty colSpan={6} message="No customers found." /> : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
