"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { profileSchema } from "@/lib/validations";
import { authClient } from "@/lib/auth/client";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm({ name, email, phone, role }: { name: string; email: string; phone: string; role: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: { name, phone } });

  const onSubmit = async (values: ProfileInput) => {
    const { error } = await authClient.updateUser({ name: values.name, phone: values.phone || "" });
    if (error) {
      toast.error(error.message ?? "Could not update your profile");
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" inputMode="tel" placeholder="01712345678" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
            <p className="mt-1.5 text-[11px] text-ink-muted">Email changes are handled by our studio to protect your order history.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving" : "Save changes"}
          </Button>
          <span className="text-[10.5px] uppercase tracking-wide2 text-ink-muted">Account type: {role.replace("_", " ")}</span>
        </div>
      </form>
      <div className="card-surface p-6">
        <p className="font-serif text-lg">Password</p>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          To change your password, sign out and use “Forgot password” on the sign-in screen. Password reset emails are sent
          to {email}.
        </p>
      </div>
    </div>
  );
}
