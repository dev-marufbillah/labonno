import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/server";
import { ProfileForm } from "@/components/site/profile-form";

export const metadata: Metadata = { title: "My profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const user = await requireUser("/login?next=/account/profile");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light">My profile</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Keep your details up to date so we can reach you about orders.</p>
      </div>
      <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ""} role={user.role} />
    </div>
  );
}
