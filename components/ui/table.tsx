import { cn } from "@/lib/utils/cn";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full min-w-[640px] border-collapse text-left text-[13px]", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-line text-[10px] uppercase tracking-wide2 text-ink-muted">{children}</thead>
  );
}

export function TH({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap px-3 py-3 font-medium", className)}>{children}</th>;
}

export function TD({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3.5 align-middle text-ink-soft", className)}>{children}</td>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-line/70 transition-colors hover:bg-cream-100/60", className)}>{children}</tr>;
}
