"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/helpers";

type Runner = () => Promise<ActionState>;

export function ActionButton({
  action,
  label,
  busyLabel = "Working",
  variant = "subtle",
  size = "sm",
  confirmTitle,
  confirmDescription,
  confirmLabel = "Confirm",
  destructive = false,
  icon,
}: {
  action: Runner;
  label: React.ReactNode;
  busyLabel?: string;
  variant?: "default" | "outline" | "subtle" | "destructive" | "ghost" | "link";
  size?: "sm" | "default" | "icon";
  confirmTitle?: string;
  confirmDescription?: string;
  confirmLabel?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const result = await action();
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  if (!confirmTitle) {
    return (
      <Button variant={variant} size={size} onClick={run} disabled={busy} type="button">
        {icon}
        {busy ? busyLabel : label}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} type="button" disabled={busy}>
          {icon}
          {busy ? busyLabel : label}
        </Button>
      </DialogTrigger>
      <DialogContent title={confirmTitle} description={confirmDescription}>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" size="sm" type="button">Cancel</Button>
          </DialogClose>
          <Button variant={destructive ? "destructive" : "default"} size="sm" onClick={run} disabled={busy} type="button">
            {busy ? busyLabel : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ToggleAction({
  action,
  checked,
  label,
}: {
  action: (next: boolean) => Promise<ActionState>;
  checked: boolean;
  label: string;
}) {
  const router = useRouter();
  const [on, setOn] = React.useState(checked);
  const [busy, setBusy] = React.useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      const result = await action(next);
      if (!result.ok) {
        setOn(!next);
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
      router.refresh();
    } catch {
      setOn(!next);
      toast.error("Could not update.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      aria-label={label}
      className={`relative inline-flex h-[22px] w-[40px] items-center rounded-full transition ${on ? "bg-gold" : "bg-ink/20"}`}
    >
      <span className={`block size-[16px] rounded-full bg-white transition-transform ${on ? "translate-x-[20px]" : "translate-x-[3px]"}`} />
    </button>
  );
}
