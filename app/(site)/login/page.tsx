import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { LoginForm } from "@/components/site/auth-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your LABONNO account to track orders and save pieces.",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="shell grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-xl bg-cream-200 lg:block">
        <Image src="/images/hero-2.jpg" alt="Labonno saree" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
          <p className="text-[9px] uppercase tracking-label text-cream/70">The house</p>
          <p className="mt-2 font-serif text-2xl">Private previews, saved pieces and order history.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-sm">
        <p className="label-line text-[9px]">Client access</p>
        <h1 className="mt-4 display-3">Welcome back</h1>
        <p className="mt-2 text-[13px] text-ink-muted">Sign in to continue to your account.</p>
        <div className="mt-7">
          <Suspense fallback={null}>
            <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
