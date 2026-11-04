"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { DISTRICTS } from "@/lib/config/site";
import { deleteAddressAction, makeDefaultAddressAction, saveAddressAction } from "@/lib/actions/account";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface AddressView {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  area: string;
  district: string;
  postcode: string;
  isDefault: boolean;
}

const EMPTY = {
  id: "",
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  area: "",
  district: "Dhaka",
  postcode: "",
};

export function AddressBook({ addresses, defaultName, defaultPhone }: { addresses: AddressView[]; defaultName: string; defaultPhone: string }) {
  const router = useRouter();
  const [form, setForm] = React.useState<typeof EMPTY | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);

  const openNew = () => {
    setErrors({});
    setForm({ ...EMPTY, fullName: defaultName, phone: defaultPhone });
  };

  const openEdit = (address: AddressView) => {
    setErrors({});
    setForm({
      id: address.id,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      area: address.area,
      district: address.district,
      postcode: address.postcode,
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    const result = await saveAddressAction({ ...form, id: form.id || undefined });
    setBusy(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setForm(null);
    router.refresh();
  };

  const remove = async (address: AddressView) => {
    if (!window.confirm(`Remove the ${address.label} address?`)) return;
    const result = await deleteAddressAction(address.id);
    result.ok ? toast.success(result.message) : toast.error(result.message);
    if (result.ok) router.refresh();
  };

  const makeDefault = async (address: AddressView) => {
    const result = await makeDefaultAddressAction(address.id);
    result.ok ? toast.success(result.message) : toast.error(result.message);
    if (result.ok) router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-muted">
          Your default address is filled in automatically at checkout.
        </p>
        <Button type="button" size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="size-3.5" /> Add address
        </Button>
      </div>

      {addresses.length === 0 && !form ? (
        <div className="rounded-lg border border-dashed border-line p-8 text-center">
          <MapPin className="mx-auto size-5 text-ink-muted" strokeWidth={1.3} />
          <p className="mt-3 font-serif text-xl">No saved addresses</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Save an address once and checkout takes seconds next time.
          </p>
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className={cn("card-surface p-5", address.isDefault && "border-gold")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-label text-ink-muted">
                  {address.label}
                  {address.isDefault ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[9px] text-gold-dark">Default</span>
                  ) : null}
                </p>
                <p className="mt-1.5 font-serif text-[15px]">{address.fullName}</p>
                <p className="text-[12px] text-ink-muted">{address.phone}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => openEdit(address)} aria-label="Edit address" className="rounded p-1.5 text-ink-muted hover:bg-cream-200/70 hover:text-ink">
                  <Pencil className="size-3.5" />
                </button>
                <button type="button" onClick={() => remove(address)} aria-label="Delete address" className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-700">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
              {address.address}, {address.area}, {address.district}
              {address.postcode ? ` ${address.postcode}` : ""}
            </p>
            {!address.isDefault ? (
              <button type="button" onClick={() => makeDefault(address)} className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-label text-gold-dark underline underline-offset-4">
                <Star className="size-3" /> Make default
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {form ? (
        <form onSubmit={submit} className="card-surface space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{form.id ? "Edit address" : "New address"}</h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Close" className="rounded p-1 text-ink-muted hover:text-ink">
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Office…" />
              <FieldError message={errors.label} />
            </div>
            <div>
              <Label htmlFor="fullName">Recipient name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <FieldError message={errors.fullName} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
              <FieldError message={errors.phone} />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Select id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </Select>
              <FieldError message={errors.district} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, road, block…" />
              <FieldError message={errors.address} />
            </div>
            <div>
              <Label htmlFor="area">Area / thana</Label>
              <Input id="area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              <FieldError message={errors.area} />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode (optional)</Label>
              <Input id="postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
              <FieldError message={errors.postcode} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : form.id ? "Save changes" : "Save address"}</Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
