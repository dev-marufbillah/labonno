"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { adjustStock } from "@/lib/actions/catalog";

export function StockAdjuster({
  productId,
  size,
  color,
  stock,
}: {
  productId: string;
  size: string;
  color: string;
  stock: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [value, setValue] = React.useState(stock);

  const adjust = async (change: number) => {
    setBusy(true);
    try {
      const result = await adjustStock(productId, size, color, change);
      if (!result.ok) toast.error(result.message);
      else {
        setValue((prev) => Math.max(0, prev + change));
        toast.success(result.message);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => adjust(-1)} disabled={busy || value <= 0} aria-label="Decrease stock" className="grid size-6 place-items-center rounded border border-line text-ink-muted hover:border-ink disabled:opacity-40">
        <Minus className="size-2.5" />
      </button>
      <span className={`w-7 text-center text-[12px] ${value === 0 ? "text-red-700" : value <= 5 ? "text-amber-700" : ""}`}>{value}</span>
      <button type="button" onClick={() => adjust(1)} disabled={busy} aria-label="Increase stock" className="grid size-6 place-items-center rounded border border-line text-ink-muted hover:border-ink disabled:opacity-40">
        <Plus className="size-2.5" />
      </button>
    </div>
  );
}
