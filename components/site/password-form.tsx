"use client";

import * as React from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  const [currentPassword, setCurrent] = React.useState("");
  const [newPassword, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Use at least 8 characters for the new password");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("The two new passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message ?? "Could not change your password");
      return;
    }
    toast.success("Password updated", { description: "Other devices have been signed out." });
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-6">
      <div>
        <h2 className="font-serif text-xl">Password</h2>
        <p className="mt-1 text-[12.5px] text-ink-muted">Choose something you do not use anywhere else.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="currentPassword">Current password</Label>
          <Input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Repeat new password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>
      <FieldHint>Changing your password signs you out everywhere else.</FieldHint>
      <Button type="submit" disabled={busy || !currentPassword || !newPassword}>
        {busy ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
