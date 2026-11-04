"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
      }}
      className={className ?? "flex items-center gap-2 text-left text-[11px] uppercase tracking-wide2 text-ink-muted transition hover:text-red-700"}
    >
      <LogOut className="size-3.5" strokeWidth={1.4} /> Sign out
    </button>
  );
}
