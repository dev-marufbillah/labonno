"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select, FieldHint } from "@/components/ui/input";
import { createStaffUser, deleteStaffUser } from "@/lib/actions/users";
import type { Role } from "@/lib/db/types";

export function StaffDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", password: "", role: "admin" as Role });

  const submit = async () => {
    setBusy(true);
    const result = await createStaffUser({ ...form, role: form.role as Role });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setForm({ name: "", email: "", password: "", role: "admin" });
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-label text-cream hover:bg-ink-soft">
          <Plus className="size-3" /> Add staff
        </button>
      </DialogTrigger>
      <DialogContent title="Add a staff account" description="They can sign in at /admin/login immediately." className="max-w-lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="staff-name">Full name</Label>
            <Input id="staff-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="staff-email">Email</Label>
            <Input id="staff-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="staff-password">Password</Label>
            <Input id="staff-password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
            <FieldHint>Share it with them privately — they can change it in their profile.</FieldHint>
          </div>
          <div>
            <Label htmlFor="staff-role">Role</Label>
            <Select id="staff-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="admin">Admin — everything except staff roles</option>
              <option value="super_admin">Super admin — full control</option>
            </Select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-[10px] uppercase tracking-label text-ink-soft hover:bg-cream-200/60">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream hover:bg-ink-soft disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-3 animate-spin" /> : null} Create account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteStaffButton({ userId, email }: { userId: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete ${email}? They will lose access immediately.`)) return;
        setBusy(true);
        const result = await deleteStaffUser(userId);
        setBusy(false);
        result.ok ? toast.success(result.message) : toast.error(result.message);
        if (result.ok) router.refresh();
      }}
      className="text-[10px] uppercase tracking-label text-ink-muted underline underline-offset-4 transition hover:text-red-700 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
