import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminRole } from "@/lib/auth/server";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user && isAdminRole(user.role)) redirect("/admin/dashboard");

  return (
    <div className="grid min-h-screen bg-footer lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: "url(/images/hero-1.jpg)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-footer via-footer/70 to-footer/30" aria-hidden />
        <p className="relative font-serif text-2xl tracking-[0.2em] text-cream">LABONNO</p>
        <div className="relative max-w-sm">
          <p className="text-[9px] uppercase tracking-[0.35em] text-cream/50">Studio</p>
          <p className="mt-3 font-serif text-3xl leading-tight text-cream">
            Manage the house — catalogue, orders, content and settings.
          </p>
          <p className="mt-4 text-[12px] text-cream/50">
            Access is restricted to authorised Labonno staff. All actions are logged.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[9px] uppercase tracking-[0.3em] text-cream/50">Admin access</p>
          <h1 className="mt-3 font-serif text-3xl text-cream">Sign in to the studio</h1>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
