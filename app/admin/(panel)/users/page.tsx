import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/server";
import { listAdminUsers } from "@/lib/services/customers";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "@/components/admin/role-select";
import { formatDate } from "@/lib/utils/format";
import type { Role } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminUsersPage() {
  const actor = await requireAdmin();
  const users = await listAdminUsers();

  return (
    <div>
      <AdminPageTitle title="Admin users & roles" description="Only a super admin can change roles. Every change is logged." />
      <Panel>
        {actor.role !== "super_admin" ? (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-[11.5px] text-amber-800">
            You are signed in as an admin. Role changes require super admin access.
          </p>
        ) : null}
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Joined</TH>
              <TH>Change role</TH>
            </TR>
          </THead>
          <tbody>
            {users.map((user) => {
              const row = user as unknown as { _id: unknown; name: string; email: string; role?: string; createdAt: Date };
              const role = (row.role ?? "customer") as Role;
              return (
                <TR key={String(row._id)}>
                  <TD className="font-medium text-ink">{row.name}</TD>
                  <TD>{row.email}</TD>
                  <TD><Badge tone={role === "super_admin" ? "gold" : "blue"}>{role.replace("_", " ")}</Badge></TD>
                  <TD>{formatDate(row.createdAt)}</TD>
                  <TD>
                    <RoleSelect
                      userId={String(row._id)}
                      role={role}
                      disabled={actor.role !== "super_admin" || actor.email === row.email}
                    />
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
          Customers are managed under Customers. New administrators are created by promoting a verified customer account.
        </p>
      </Panel>
    </div>
  );
}
