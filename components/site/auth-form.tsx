"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations";
import { authClient } from "@/lib/auth/client";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}/account` });
      }}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white py-3 text-[10.5px] uppercase tracking-label text-ink transition hover:border-ink"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.6V6.8H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.8l4 3.1A7 7 0 0 1 12 4.8Z" />
      </svg>
      {label}
    </button>
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    const { error } = await authClient.signIn.email({ email: values.email, password: values.password });
    if (error) {
      toast.error(error.message ?? "Could not sign you in");
      return;
    }
    toast.success("Welcome back");
    router.push(next);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="size-3 animate-spin" /> Signing in</> : "Sign in"}
        </Button>
      </form>
      {googleEnabled ? (
        <>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide2 text-ink-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton label="Continue with Google" />
        </>
      ) : null}
      <p className="text-center text-[12px] text-ink-muted">
        New to Labonno?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4">Create an account</Link>
      </p>
    </div>
  );
}

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone || undefined,
    });
    if (error) {
      toast.error(error.message ?? "Could not create your account");
      return;
    }
    toast.success("Account created — welcome to Labonno");
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" placeholder="Nusrat Jahan" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="reg-email">Email</Label>
          <Input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="reg-phone">Mobile number (optional)</Label>
          <Input id="reg-phone" inputMode="tel" autoComplete="tel" placeholder="01712345678" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="reg-confirm">Confirm password</Label>
            <Input id="reg-confirm" type="password" autoComplete="new-password" placeholder="Repeat password" {...register("confirmPassword")} />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="size-3 animate-spin" /> Creating account</> : "Create account"}
        </Button>
      </form>
      {googleEnabled ? (
        <>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide2 text-ink-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton label="Sign up with Google" />
        </>
      ) : null}
      <p className="text-center text-[12px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}
