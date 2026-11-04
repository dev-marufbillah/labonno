"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { authClient, authErrorMessage } from "@/lib/auth/client";

export function AdminLoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    const { data, error } = await authClient.signIn.email({ email: values.email, password: values.password });
    if (error) {
      const { message, hint } = authErrorMessage(error);
      toast.error(message, hint ? { description: hint, duration: 9000 } : undefined);
      return;
    }
    const role = (data?.user as { role?: string } | undefined)?.role;
    if (role !== "admin" && role !== "super_admin") {
      // Owner addresses are promoted on the spot; everyone else needs an invitation.
      const claim = await fetch("/api/auth/claim-owner", { method: "POST" }).catch(() => null);
      if (!claim?.ok) {
        await authClient.signOut();
        toast.error("This account does not have studio access.", {
          description: "Ask the owner to add your email under Admin → Users, then sign in again.",
          duration: 9000,
        });
        return;
      }
    }
    toast.success("Welcome to the studio");
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream/50">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="h-11 w-full rounded-md border border-cream/15 bg-cream/5 px-3.5 text-[13px] text-cream outline-none transition placeholder:text-cream/30 focus:border-gold"
          placeholder="admin@labonno.com"
        />
        {errors.email ? <p className="mt-1 text-[11px] text-red-300">{errors.email.message}</p> : null}
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream/50">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="h-11 w-full rounded-md border border-cream/15 bg-cream/5 px-3.5 text-[13px] text-cream outline-none transition placeholder:text-cream/30 focus:border-gold"
          placeholder="••••••••"
        />
        {errors.password ? <p className="mt-1 text-[11px] text-red-300">{errors.password.message}</p> : null}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-cream py-3 text-[10px] uppercase tracking-label text-ink transition hover:bg-white disabled:opacity-60"
      >
        {isSubmitting ? <><Loader2 className="size-3 animate-spin" /> Signing in</> : "Sign in"}
      </button>
      <p className="text-center text-[10.5px] leading-relaxed text-cream/40">
        Studio accounts only. Customer accounts sign in at{" "}
        <a href="/login" className="underline underline-offset-2 hover:text-cream">/login</a>.
      </p>
    </form>
  );
}
