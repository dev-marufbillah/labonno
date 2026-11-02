import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { AdminPageTitle, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Appearance" };

export default async function AppearanceSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <AdminPageTitle title="Appearance" description="Logo, favicon and the typography that carries the brand." />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SettingsForm
          title="Brand assets"
          group="appearance"
          folder="brand"
          values={{ appearance: settings.appearance }}
          fields={[
            { path: "appearance.logoText", label: "Logo wordmark" },
            { path: "appearance.accentColor", label: "Accent colour (hex)" },
            { path: "appearance.serifFont", label: "Display font", hint: "Loaded through next/font in the codebase — change the Google font name here for reference." },
            { path: "appearance.sansFont", label: "Body font" },
            { path: "appearance.logoImage", label: "Logo image (optional)", type: "image", full: true, hint: "Leave empty to use the typographic wordmark." },
            { path: "appearance.favicon", label: "Favicon", type: "image", full: true },
          ]}
        />
        <Panel title="Preview">
          <div className="rounded-lg bg-cream p-6 text-center">
            {settings.appearance.logoImage ? (
              <div className="relative mx-auto h-12 w-40">
                <Image src={settings.appearance.logoImage} alt="Logo" fill sizes="160px" className="object-contain" />
              </div>
            ) : (
              <>
                <p className="font-serif text-2xl tracking-[0.18em]">{settings.appearance.logoText}</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.4em] text-ink-muted">{settings.general.tagline}</p>
              </>
            )}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="size-6 rounded-full border border-line" style={{ backgroundColor: settings.appearance.accentColor }} />
              <span className="text-[11px] text-ink-muted">{settings.appearance.accentColor}</span>
            </div>
            <button type="button" className="mt-6 rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream">
              Primary button
            </button>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
            The storefront uses a light ivory palette with deep charcoal and a muted gold accent. Colour and typography
            are applied through design tokens, so the site stays consistent across every page.
          </p>
        </Panel>
      </div>
    </div>
  );
}
