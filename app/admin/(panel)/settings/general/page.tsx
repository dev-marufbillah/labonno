import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { AdminPageTitle } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "General settings" };

export default async function GeneralSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <AdminPageTitle title="General settings" description="Brand identity, contact details and the announcement bar." />
      <div className="space-y-4">
        <SettingsForm
          title="Brand"
          group="general"
          values={{ general: settings.general }}
          fields={[
            { path: "general.brandName", label: "Brand name" },
            { path: "general.brandNameBn", label: "Brand name (Bangla)" },
            { path: "general.tagline", label: "Tagline" },
            { path: "general.announcement", label: "Announcement bar", type: "textarea", hint: "Shown at the very top of every storefront page." },
            { path: "general.email", label: "Contact email", type: "email" },
            { path: "general.phone", label: "Contact phone", type: "tel" },
            { path: "general.whatsapp", label: "WhatsApp number", type: "tel" },
            { path: "general.address", label: "Studio address", full: true },
            { path: "general.currency", label: "Currency code" },
            { path: "general.currencySymbol", label: "Currency symbol" },
          ]}
        />
        <SettingsForm
          title="SEO defaults"
          group="seo"
          values={{ seo: settings.seo }}
          fields={[
            { path: "seo.defaultTitle", label: "Default page title" },
            { path: "seo.titleTemplate", label: "Title template", hint: "%s is replaced with the page title." },
            { path: "seo.defaultDescription", label: "Default meta description", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}
