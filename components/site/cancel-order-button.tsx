"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const cancelOrder = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) throw new Error(data.message || "Could not cancel this order");
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel this order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-[10px] uppercase tracking-label text-red-700 underline underline-offset-4">
          Cancel order
        </button>
      </DialogTrigger>
      <DialogContent title="Cancel this order?" description="This cannot be undone. Stock will be released back to the collection.">
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Keep order</Button>
          </DialogClose>
          <Button variant="destructive" size="sm" onClick={cancelOrder} disabled={busy}>
            {busy ? "Cancelling" : "Yes, cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
