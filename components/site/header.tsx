import { getSiteSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth/server";
import { HeaderClient } from "./header-client";

export async function SiteHeader() {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);
  return (
    <HeaderClient
      navigation={settings.navigation.header}
      announcement={settings.general.announcement}
      brandName={settings.general.brandName}
      tagline={settings.general.tagline}
      user={user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null}
    />
  );
}
