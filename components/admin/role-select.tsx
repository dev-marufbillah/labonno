"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setUserRole } from "@/lib/actions/users";
import type { Role } from "@/lib/db/types";

export function RoleSelect({ userId, role, disabled }: { userId: string; role: Role; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const change = async (next: Role) => {
    if (next === role) return;
    setBusy(true);
    try {
      const result = await setUserRole(userId, next);
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={role}
      disabled={busy || disabled}
      onChange={(event) => change(event.target.value as Role)}
      className="h-9 rounded-md border border-line bg-white/70 px-2 text-[11.5px] disabled:opacity-60"
    >
      <option value="customer">Customer</option>
      <option value="admin">Admin</option>
      <option value="super_admin">Super admin</option>
    </select>
  );
}
