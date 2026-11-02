"use client";

import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils/cn";

export const Dropdown = DropdownPrimitive.Root;
export const DropdownTrigger = DropdownPrimitive.Trigger;

export function DropdownContent({ children, align = "end", className }: { children: React.ReactNode; align?: "start" | "center" | "end"; className?: string }) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={8}
        className={cn(
          "z-50 min-w-[200px] overflow-hidden rounded-lg border border-line bg-cream-50 p-1.5 shadow-luxe data-[state=open]:animate-fade-in",
          className
        )}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}

export function DropdownItem({
  children,
  onSelect,
  destructive,
  className,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  className?: string;
}) {
  return (
    <DropdownPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "cursor-pointer rounded-md px-3 py-2 text-[13px] outline-none transition-colors data-[highlighted]:bg-cream-200/70",
        destructive ? "text-red-700" : "text-ink-soft",
        className
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <DropdownPrimitive.Label className="px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-ink-muted">{children}</DropdownPrimitive.Label>;
}

export function DropdownSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-line" />;
}
