import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_NAV, ADMIN_CONTENT_NAV, ADMIN_SETTINGS_NAV } from "@/lib/config/site";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · LABONNO Studio" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      groups={[
        { title: "Commerce", items: [...ADMIN_NAV] },
        { title: "Content", items: [...ADMIN_CONTENT_NAV] },
        { title: "Settings", items: [...ADMIN_SETTINGS_NAV] },
      ]}
    >
      {children}
    </AdminShell>
  );
}
