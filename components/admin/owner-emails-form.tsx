"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, ShieldCheck, X } from "lucide-react";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { saveSettings } from "@/lib/actions/content";
import { DEFAULT_OWNER_EMAILS } from "@/lib/auth/owner-emails";

/**
 * Owner addresses. Any account with one of these emails keeps full studio access —
 * it is promoted to super admin automatically the next time it opens the panel.
 */
export function OwnerEmailsForm({ emails }: { emails: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [list, setList] = React.useState<string[]>(emails);
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const value = draft.trim().toLowerCase();
    if (!value.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (list.includes(value)) {
      toast.error("That address is already on the list.");
      return;
    }
    setList([...list, value]);
    setDraft("");
  };

  const save = async () => {
    setBusy(true);
    const result = await saveSettings({ access: { ownerEmails: list } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Owner addresses saved.");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {list.length === 0 ? (
          <p className="text-[11.5px] text-ink-muted">No owner addresses yet.</p>
        ) : (
          list.map((email) => {
            const locked = DEFAULT_OWNER_EMAILS.includes(email);
            return (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 py-1 pl-2.5 pr-1.5 text-[11px] text-ink"
              >
                <ShieldCheck className="size-3 text-gold-dark" />
                {email}
                {locked ? (
                  <span className="pr-1 text-[9px] uppercase tracking-wide2 text-ink-muted">always</span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${email}`}
                    onClick={() => setList(list.filter((item) => item !== email))}
                    className="grid size-5 place-items-center rounded-full text-ink-muted hover:bg-cream-200 hover:text-red-700"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </span>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="owner-email">Add another owner</Label>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              add();
            }}
          >
            <Input
              id="owner-email"
              type="email"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="name@example.com"
            />
          </form>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-line px-4 text-[10px] uppercase tracking-label text-ink hover:border-ink"
        >
          <Plus className="size-3" /> Add
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[10px] uppercase tracking-label text-cream hover:bg-ink-soft disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-3 animate-spin" /> : null} Save list
        </button>
      </div>
      <FieldHint>
        An owner email gets into the studio even without an invitation: sign up with it and the
        account becomes super admin automatically. Everyone else who registers is a normal customer.
      </FieldHint>
    </div>
  );
}
