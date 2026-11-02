"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { contactSchema } from "@/lib/validations";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactInput) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send your message");
      toast.success(data.message ?? "Message sent — we will be in touch within one business day.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your message");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" placeholder="Nusrat Jahan" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" placeholder="you@example.com" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="c-phone">Mobile (optional)</Label>
          <Input id="c-phone" inputMode="tel" placeholder="01712345678" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="c-subject">Subject</Label>
          <Input id="c-subject" placeholder="Order, fitting, made-to-measure…" {...register("subject")} />
          <FieldError message={errors.subject?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" placeholder="How can our studio help?" {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending" : "Send message"}
      </Button>
    </form>
  );
}
