"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { resendOrderEmail } from "@/lib/actions/orders";

export function ResendEmailButton({ orderId, email }: { orderId: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await resendOrderEmail(orderId);
        setBusy(false);
        result.ok ? toast.success(result.message) : toast.error(result.message);
        if (result.ok) router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[10px] uppercase tracking-label text-ink transition hover:bg-cream-200/60 disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-3 animate-spin" /> : <Mail className="size-3" />}
      Resend confirmation to {email}
    </button>
  );
}
