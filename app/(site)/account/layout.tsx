import { requireUser } from "@/lib/auth/server";
import { AccountNav } from "@/components/site/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/login?next=/account");

  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside>
          <p className="label-line text-[9px]">My account</p>
          <p className="mt-3 font-serif text-2xl leading-tight">{user.name}</p>
          <p className="text-[11.5px] text-ink-muted">{user.email}</p>
          <div className="mt-6">
            <AccountNav />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
