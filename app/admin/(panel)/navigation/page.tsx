import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { AdminPageTitle } from "@/components/admin/ui";
import { NavigationEditor } from "@/components/admin/navigation-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Navigation" };

export default async function AdminNavigationPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <AdminPageTitle title="Navigation & footer" description="Control the header menu, footer columns and social links." />
      <NavigationEditor
        header={settings.navigation.header}
        footer={settings.navigation.footer}
        social={settings.navigation.social}
      />
    </div>
  );
}
