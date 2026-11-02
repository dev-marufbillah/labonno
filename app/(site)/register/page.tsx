import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { RegisterForm } from "@/components/site/auth-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a LABONNO account for faster checkout, order tracking and saved pieces.",
  robots: { index: false, follow: true },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="shell grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-xl bg-cream-200 lg:block">
        <Image src="/images/product-2.jpg" alt="Labonno silk dress" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
          <p className="text-[9px] uppercase tracking-label text-cream/70">Labonno circle</p>
          <p className="mt-2 font-serif text-2xl">Save your fit, follow your orders, hear about new pieces first.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <p className="label-line text-[9px]">Join the house</p>
        <h1 className="mt-4 display-3">Create your account</h1>
        <p className="mt-2 text-[13px] text-ink-muted">It takes less than a minute.</p>
        <div className="mt-7">
          <RegisterForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
        </div>
      </div>
    </div>
  );
}
