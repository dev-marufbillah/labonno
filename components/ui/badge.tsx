import { cn } from "@/lib/utils/cn";

const tones: Record<string, string> = {
  neutral: "bg-ink/5 text-ink-soft",
  gold: "bg-gold/15 text-gold-dark",
  green: "bg-emerald-700/10 text-emerald-800",
  amber: "bg-amber-500/15 text-amber-800",
  red: "bg-red-700/10 text-red-800",
  blue: "bg-blue-700/10 text-blue-800",
  dark: "bg-ink text-cream",
};

 export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide2",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ value, kind = "order" }: { value: string; kind?: "order" | "payment" }) {
  const map: Record<string, keyof typeof tones> = {
    pending: "amber",
    confirmed: "blue",
    processing: "blue",
    shipped: "gold",
    delivered: "green",
    cancelled: "red",
    returned: "neutral",
    unpaid: "neutral",
    pending_verification: "amber",
    paid: "green",
    refunded: "blue",
    failed: "red",
    published: "green",
    draft: "amber",
    archived: "neutral",
    approved: "green",
    rejected: "red",
  };
  const label = value.replace(/_/g, " ");
  return (
    <Badge tone={map[value] ?? "neutral"} className="capitalize">
      {kind === "payment" ? label : label}
    </Badge>
  );
}
