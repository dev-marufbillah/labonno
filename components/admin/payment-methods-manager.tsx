"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea, FieldHint } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import {
  deletePaymentMethod,
  movePaymentMethod,
  savePaymentMethod,
  togglePaymentMethod,
} from "@/lib/actions/payments";

export interface PaymentMethodView {
  id: string;
  key: string;
  label: string;
  kind: "manual" | "gateway";
  enabled: boolean;
  order: number;
  description: string;
  instructions: string;
  number: string;
  accountType: string;
  requiresReference: boolean;
  gateway: "bkash" | "sslcommerz" | null;
  badge: string;
  hasCredentials: boolean;
  sandbox: boolean;
}

const BLANK = {
  key: "",
  label: "",
  kind: "manual" as "manual" | "gateway",
  enabled: true,
  order: 10,
  description: "",
  instructions: "",
  number: "",
  accountType: "Merchant",
  requiresReference: true,
  gateway: "bkash" as "bkash" | "sslcommerz" | null,
  badge: "",
  appKey: "",
  appSecret: "",
  username: "",
  password: "",
  storeId: "",
  storePassword: "",
  sandbox: true,
};

export function PaymentMethodsManager({ methods }: { methods: PaymentMethodView[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PaymentMethodView | null>(null);
  const [form, setForm] = React.useState({ ...BLANK });

  const startNew = () => {
    setEditing(null);
    setForm({ ...BLANK, order: (methods.at(-1)?.order ?? 0) + 1 });
    setOpen(true);
  };

  const startEdit = (method: PaymentMethodView) => {
    setEditing(method);
    setForm({
      ...BLANK,
      ...method,
      // Secrets are never sent to the browser — leave blank to keep the stored value.
      appKey: "",
      appSecret: "",
      username: "",
      password: "",
      storeId: "",
      storePassword: "",
    });
    setOpen(true);
  };

  const submit = async () => {
    setBusy("save");
    const payload = {
      key: form.key,
      label: form.label,
      kind: form.kind,
      enabled: form.enabled,
      order: Number(form.order) || 10,
      description: form.description,
      instructions: form.instructions,
      number: form.number,
      accountType: form.accountType,
      requiresReference: form.requiresReference,
      gateway: form.gateway,
      badge: form.badge,
      config:
        form.kind === "gateway"
          ? {
              ...(form.gateway === "bkash"
                ? { appKey: form.appKey, appSecret: form.appSecret, username: form.username, password: form.password }
                : { storeId: form.storeId, storePassword: form.storePassword }),
              sandbox: form.sandbox,
            }
          : undefined,
    };
    const result = await savePaymentMethod(payload, editing?.id);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setOpen(false);
    router.refresh();
  };

  const run = async (id: string, action: () => Promise<{ ok: boolean; message: string }>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(id);
    const result = await action();
    setBusy(null);
    result.ok ? toast.success(result.message) : toast.error(result.message);
    if (result.ok) router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[12px] leading-relaxed text-ink-muted">
          These are the options customers see at checkout, in this order. Add as many as you like —
          mobile wallets, bank transfer, cash on delivery, or a live gateway.
        </p>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-label text-cream hover:bg-ink-soft"
        >
          <Plus className="size-3" /> Add payment method
        </button>
      </div>

      <ul className="space-y-2.5">
        {methods.map((method) => (
          <li key={method.id} className={cn("card-surface flex flex-wrap items-start gap-4 p-4", !method.enabled && "opacity-60")}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-serif text-[16px]">{method.label}</p>
                {method.badge ? <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[9px] uppercase tracking-wide2 text-gold-dark">{method.badge}</span> : null}
                <Badge tone={method.enabled ? "green" : "neutral"}>{method.enabled ? "Active" : "Off"}</Badge>
                <span className="text-[10px] uppercase tracking-wide2 text-ink-muted">
                  {method.kind === "gateway" ? `gateway · ${method.gateway}` : method.requiresReference ? "manual · verified" : "manual"}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-muted">{method.description || method.instructions || "—"}</p>
              <p className="mt-1 text-[10.5px] text-ink-muted">
                id <span className="font-mono text-ink-soft">{method.key}</span>
                {method.number ? ` · ${method.accountType || "account"} ${method.number}` : ""}
                {method.kind === "gateway" ? ` · ${method.hasCredentials ? `credentials saved${method.sandbox ? " (sandbox)" : " (live)"}` : "using environment keys"}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button type="button" aria-label="Move up" onClick={() => run(method.id, () => movePaymentMethod(method.id, "up"))} className="rounded p-1.5 text-ink-muted hover:bg-cream-200/70 hover:text-ink">
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" aria-label="Move down" onClick={() => run(method.id, () => movePaymentMethod(method.id, "down"))} className="rounded p-1.5 text-ink-muted hover:bg-cream-200/70 hover:text-ink">
                <ArrowDown className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => run(method.id, () => togglePaymentMethod(method.id, !method.enabled))}
                disabled={busy === method.id}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-label transition",
                  method.enabled ? "border-line text-ink-soft hover:border-red-300 hover:text-red-700" : "border-ink/25 text-ink hover:bg-ink hover:text-cream"
                )}
              >
                {method.enabled ? "Switch off" : "Switch on"}
              </button>
              <button type="button" aria-label="Edit" onClick={() => startEdit(method)} className="rounded p-1.5 text-ink-muted hover:bg-cream-200/70 hover:text-ink">
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Delete"
                onClick={() => run(method.id, () => deletePaymentMethod(method.id), `Delete ${method.label}? Past orders keep their record.`)}
                className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="sr-only">Open</DialogTrigger>
        <DialogContent
          title={editing ? `Edit ${editing.label}` : "New payment method"}
          description="Everything here is shown to customers at checkout, except the gateway secrets."
          className="max-w-2xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pm-label">Name customers see</Label>
              <Input id="pm-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Rocket" />
            </div>
            <div>
              <Label htmlFor="pm-key">Id used on orders</Label>
              <Input id="pm-key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="rocket" />
              <FieldHint>Lowercase, no spaces. Once an order uses it, keep it unchanged.</FieldHint>
            </div>
            <div>
              <Label htmlFor="pm-kind">How it works</Label>
              <Select id="pm-kind" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "manual" | "gateway" })}>
                <option value="manual">Manual — customer sends money, you verify</option>
                <option value="gateway">Gateway — redirect to the provider</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="pm-order">Position at checkout</Label>
              <Input id="pm-order" type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pm-desc">One-line description</Label>
              <Input id="pm-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Send money from your Rocket app." />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pm-instr">Instructions shown at checkout</Label>
              <Textarea id="pm-instr" rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </div>

            {form.kind === "manual" ? (
              <>
                <div>
                  <Label htmlFor="pm-number">Number / account to pay into</Label>
                  <Input id="pm-number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="01711 000 000" />
                </div>
                <div>
                  <Label htmlFor="pm-account-type">Account type</Label>
                  <Input id="pm-account-type" value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} placeholder="Merchant" />
                </div>
                <label className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" checked={form.requiresReference} onChange={(e) => setForm({ ...form, requiresReference: e.target.checked })} className="size-3.5 accent-[#1C1B18]" />
                  <span className="text-[12px] text-ink-soft">Ask for the sender number and transaction ID (recommended for wallets)</span>
                </label>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="pm-gateway">Provider</Label>
                  <Select id="pm-gateway" value={form.gateway ?? "bkash"} onChange={(e) => setForm({ ...form, gateway: e.target.value as "bkash" | "sslcommerz" })}>
                    <option value="bkash">bKash (tokenized checkout)</option>
                    <option value="sslcommerz">SSLCommerz (cards + wallets)</option>
                  </Select>
                </div>
                <label className="flex items-end gap-2 pb-1">
                  <input type="checkbox" checked={form.sandbox} onChange={(e) => setForm({ ...form, sandbox: e.target.checked })} className="size-3.5 accent-[#1C1B18]" />
                  <span className="text-[12px] text-ink-soft">Sandbox mode</span>
                </label>

                {form.gateway === "bkash" ? (
                  <>
                    <div>
                      <Label htmlFor="pm-app-key">App key</Label>
                      <Input id="pm-app-key" value={form.appKey} onChange={(e) => setForm({ ...form, appKey: e.target.value })} placeholder={editing?.hasCredentials ? "•••• saved — leave blank to keep" : "bKash app key"} />
                    </div>
                    <div>
                      <Label htmlFor="pm-app-secret">App secret</Label>
                      <Input id="pm-app-secret" type="password" value={form.appSecret} onChange={(e) => setForm({ ...form, appSecret: e.target.value })} placeholder={editing?.hasCredentials ? "•••• saved" : ""} />
                    </div>
                    <div>
                      <Label htmlFor="pm-user">Username</Label>
                      <Input id="pm-user" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="pm-pass">Password</Label>
                      <Input id="pm-pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="pm-store">Store id</Label>
                      <Input id="pm-store" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} placeholder={editing?.hasCredentials ? "•••• saved" : "SSLCommerz store id"} />
                    </div>
                    <div>
                      <Label htmlFor="pm-store-pass">Store password</Label>
                      <Input id="pm-store-pass" type="password" value={form.storePassword} onChange={(e) => setForm({ ...form, storePassword: e.target.value })} />
                    </div>
                  </>
                )}
                <p className="sm:col-span-2 flex items-start gap-2 rounded-md bg-cream-200/60 p-3 text-[11px] leading-relaxed text-ink-soft">
                  <Zap className="mt-0.5 size-3.5 shrink-0" />
                  Leave the credentials empty to use the values in <code className="font-mono">.env.local</code>. Saved values are stored with the method and take priority.
                </p>
              </>
            )}

            <div>
              <Label htmlFor="pm-badge">Badge (optional)</Label>
              <Input id="pm-badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Most popular" />
            </div>
            <label className="flex items-end gap-2 pb-1">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="size-3.5 accent-[#1C1B18]" />
              <span className="text-[12px] text-ink-soft">Show at checkout</span>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-[10px] uppercase tracking-label text-ink-soft hover:bg-cream-200/60">
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy === "save"}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[10px] uppercase tracking-label text-cream hover:bg-ink-soft disabled:opacity-60"
            >
              {busy === "save" ? <Loader2 className="size-3 animate-spin" /> : null}
              {editing ? "Save changes" : "Add method"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
