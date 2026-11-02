import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/server";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { ProfileForm } from "@/components/site/profile-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My profile" };

export default async function AdminProfilePage() {
  const user = await requireAdmin();
  return (
    <div>
      <AdminPageTitle title="My profile" description="Your studio account details." />
      <div className="max-w-2xl space-y-4">
        <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ""} role={user.role} />
        <Panel title="Access">
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Signed in as <strong className="font-medium">{user.email}</strong> with the{" "}
            <strong className="font-medium">{user.role.replace("_", " ")}</strong> role. Permissions are validated on the
            server for every action; the browser never decides what you can do.
          </p>
        </Panel>
      </div>
    </div>
  );
}
