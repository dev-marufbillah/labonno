"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2, Lock } from "lucide-react";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { DISTRICTS, PAYMENT_METHOD_LABELS } from "@/lib/config/site";
import { Input, Label, Select, Textarea, FieldError, FieldHint } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useCommerce } from "./commerce-provider";
import { EmptyState } from "./empty-state";
import type { SiteSettingsDoc } from "@/lib/db/types";

interface DistrictCharge {
  district: string;
  charge: number;
}

export function CheckoutForm({
  settings,
  prefill,
}: {
  settings: SiteSettingsDoc;
  prefill: { name: string; email: string; phone: string } | null;
}) {
  const router = useRouter();
  const { cart, cartReady, subtotal, clearCart } = useCommerce();
  const [couponCode, setCouponCode] = React.useState("");
  const [coupon, setCoupon] = React.useState<{ code: string; discount: number } | null>(null);
  const [couponBusy, setCouponBusy] = React.useState(false);

  const enabledMethods = (["cod", "bkash", "nagad", "sslcommerz"] as const).filter(
    (method) => settings.payments[method]?.enabled
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer: { name: prefill?.name ?? "", email: prefill?.email ?? "", phone: prefill?.phone ?? "" },
      shippingAddress: { address: "", area: "", district: "Dhaka", postcode: "", note: "" },
      items: [],
      paymentMethod: enabledMethods[0] ?? "cod",
      couponCode: null,
      paymentReference: null,
    },
  });

  const district = watch("shippingAddress.district");
  const paymentMethod = watch("paymentMethod");

  const deliveryCharge = React.useMemo(() => {
    const zone = settings.shipping.zones?.find((z) => z.district.toLowerCase() === (district ?? "").toLowerCase());
    const base = zone
      ? zone.charge
      : district === "Dhaka"
        ? settings.shipping.insideDhakaCharge
        : settings.shipping.outsideDhakaCharge;
    return base;
  }, [district, settings.shipping]);

  const discount = coupon?.discount ?? 0;
  const freeShipping =
    settings.shipping.freeShippingThreshold > 0 && subtotal - discount >= settings.shipping.freeShippingThreshold;
  const finalDelivery = freeShipping ? 0 : deliveryCharge;
  const total = Math.max(0, subtotal - discount) + finalDelivery;

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = (await res.json()) as { valid: boolean; discount: number; message: string };
      if (!data.valid) {
        setCoupon(null);
        toast.error(data.message);
      } else {
        setCoupon({ code: code.toUpperCase(), discount: data.discount });
        setValue("couponCode", code.toUpperCase());
        toast.success(data.message);
      }
    } catch {
      toast.error("Could not verify the coupon right now");
    } finally {
      setCouponBusy(false);
    }
  };

  const onSubmit = async (values: CheckoutInput) => {
    if (!cart.length) {
      toast.error("Your bag is empty");
      return;
    }
    try {
      const payload = {
        ...values,
        items: cart.map((line) => ({
          productId: line.productId,
          size: line.size,
          color: line.color,
          quantity: line.quantity,
        })),
        couponCode: coupon?.code ?? null,
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        orderNumber?: string;
        error?: string;
        redirectUrl?: string;
      };
      if (!res.ok || !data.orderNumber) throw new Error(data.error ?? "Could not place the order");
      clearCart();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      router.push(`/order-success?order=${data.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order");
    }
  };

  if (!cartReady) {
    return <div className="shell py-16"><div className="h-40 animate-pulse rounded-lg bg-cream-200/60" /></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="shell py-10">
        <EmptyState
          title="Nothing to check out yet"
          description="Add a piece to your bag and your checkout will appear here."
          actionLabel="Shop the collection"
          actionHref="/shop"
        />
      </div>
    );
  }

  const districts = DISTRICTS as readonly string[];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="shell grid gap-10 py-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
      <div className="space-y-9">
        <section>
          <h2 className="font-serif text-xl">1 · Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customer-name">Full name</Label>
              <Input id="customer-name" autoComplete="name" placeholder="Nusrat Jahan" {...register("customer.name")} />
              <FieldError message={errors.customer?.name?.message} />
            </div>
            <div>
              <Label htmlFor="customer-phone">Mobile number</Label>
              <Input id="customer-phone" inputMode="tel" autoComplete="tel" placeholder="01712345678" {...register("customer.phone")} />
              <FieldError message={errors.customer?.phone?.message} />
              <FieldHint>We call to confirm every order before dispatch.</FieldHint>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("customer.email")} />
              <FieldError message={errors.customer?.email?.message} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl">2 · Delivery</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Input id="address" autoComplete="street-address" placeholder="House 27, Road 11, Block C" {...register("shippingAddress.address")} />
              <FieldError message={errors.shippingAddress?.address?.message} />
            </div>
            <div>
              <Label htmlFor="area">Area / Thana</Label>
              <Input id="area" placeholder="Banani" {...register("shippingAddress.area")} />
              <FieldError message={errors.shippingAddress?.area?.message} />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Select id="district" {...register("shippingAddress.district")}>
                {districts.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <FieldError message={errors.shippingAddress?.district?.message} />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode (optional)</Label>
              <Input id="postcode" inputMode="numeric" placeholder="1213" {...register("shippingAddress.postcode")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="note">Order note (optional)</Label>
              <Textarea id="note" placeholder="Delivery instructions, measurements for made-to-order pieces…" {...register("shippingAddress.note")} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl">3 · Payment</h2>
          <div className="mt-4 space-y-2.5">
            {enabledMethods.map((method) => (
              <label
                key={method}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                  paymentMethod === method ? "border-ink bg-cream-50" : "border-line hover:border-ink/40"
                )}
              >
                <input
                  type="radio"
                  value={method}
                  {...register("paymentMethod")}
                  className="mt-1 size-3.5 accent-[#1C1B18]"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-ink">{PAYMENT_METHOD_LABELS[method]}</span>
                    {method === "cod" ? <span className="text-[10px] uppercase tracking-wide2 text-ink-muted">Most popular</span> : null}
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-relaxed text-ink-muted">
                    {settings.payments[method]?.instructions}
                  </span>
                  {method === "bkash" || method === "nagad" ? (
                    <span className="mt-1 block text-[11.5px] text-ink">
                      Send to <strong className="font-medium">{settings.payments[method].number}</strong>
                    </span>
                  ) : null}

                  {paymentMethod === method && (method === "bkash" || method === "nagad") ? (
                    <span className="mt-3 grid gap-3 sm:grid-cols-2">
                      <span>
                        <Label htmlFor={`${method}-sender`}>Your {PAYMENT_METHOD_LABELS[method]} number</Label>
                        <Input id={`${method}-sender`} inputMode="tel" placeholder="01712345678" {...register("paymentReference.senderNumber")} />
                      </span>
                      <span>
                        <Label htmlFor={`${method}-trx`}>Transaction ID</Label>
                        <Input id={`${method}-trx`} placeholder="e.g. 9F2K1LQ7XZ" {...register("paymentReference.transactionId")} />
                        <FieldError message={errors.paymentReference?.transactionId?.message} />
                      </span>
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11px] text-ink-muted">
            <Lock className="mt-0.5 size-3 shrink-0" /> Payments are verified on our server before dispatch. We never mark
            an order paid without confirmation from the provider.
          </p>
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-28">
        <div className="rounded-xl border border-line bg-cream-50 p-6">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <ul className="mt-4 divide-y divide-line/70">
            {cart.map((line) => (
              <li key={line.key} className="flex gap-3 py-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream-200">
                  <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[14px]">{line.name}</p>
                  <p className="text-[10.5px] uppercase tracking-wide2 text-ink-muted">
                    {line.size} · {line.color} · ×{line.quantity}
                  </p>
                  <p className="mt-0.5 text-[12px]">{formatMoney(line.price * line.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-center gap-2">
              <Input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-10 text-[12px] uppercase tracking-wide2"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponBusy}
                className="h-10 shrink-0 rounded-md border border-line px-3 text-[10px] uppercase tracking-wide2 text-ink transition hover:border-ink disabled:opacity-50"
              >
                {couponBusy ? <Loader2 className="size-3 animate-spin" /> : "Apply"}
              </button>
            </div>
            {coupon ? (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-800">
                <Check className="size-3" /> {coupon.code} applied
              </p>
            ) : null}
          </div>

          <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-emerald-800">
                <dt>Discount</dt>
                <dd>−{formatMoney(discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-muted">Delivery {freeShipping ? "(free)" : ""}</dt>
              <dd>{finalDelivery === 0 ? "Free" : formatMoney(finalDelivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-serif text-lg">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft disabled:opacity-60"
          >
            {isSubmitting ? <><Loader2 className="size-3 animate-spin" /> Placing order</> : "Place order"}
          </button>
          <p className="mt-3 text-center text-[10.5px] leading-relaxed text-ink-muted">
            By placing this order you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">terms</Link> and{" "}
            <Link href="/return-policy" className="underline underline-offset-2">return policy</Link>.
          </p>
        </div>
      </aside>
    </form>
  );
}
