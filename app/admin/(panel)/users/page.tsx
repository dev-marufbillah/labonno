import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/server";
import { listAdminUsers } from "@/lib/services/customers";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { OwnerEmailsForm } from "@/components/admin/owner-emails-form";
import { getSiteSettings } from "@/lib/services/settings";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "@/components/admin/role-select";
import { StaffDialog, DeleteStaffButton } from "@/components/admin/staff-form";
import { formatDate } from "@/lib/utils/format";
import type { Role } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminUsersPage() {
  const actor = await requireAdmin();
  const [users, settings] = await Promise.all([listAdminUsers(), getSiteSettings()]);
  const owners = settings.access?.ownerEmails ?? [];

  return (
    <div>
      <AdminPageTitle
        title="Admin users & roles"
        description="Only a super admin can add staff, change roles or remove access. Every change is logged."
        action={actor.role === "super_admin" ? <StaffDialog /> : undefined}
      />
      {actor.role === "super_admin" ? (
        <Panel title="Owner addresses" description="These emails always have full studio access — no invitation needed.">
          <OwnerEmailsForm emails={owners} />
        </Panel>
      ) : null}

      <Panel className="mt-5">
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
              <TH className="text-right">Remove</TH>
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
                  <TD className="text-right">
                    {actor.role === "super_admin" && actor.email !== row.email ? (
                      <DeleteStaffButton userId={String(row._id)} email={row.email} />
                    ) : (
                      <span className="text-[10px] uppercase tracking-label text-ink-muted">—</span>
                    )}
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
          “Add staff” creates an account that can sign in at /admin/login straight away. Customers are managed under Customers.
        </p>
      </Panel>
    </div>
  );
}
