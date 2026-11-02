"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ value, question, answer }: { value: string; question: string; answer: string }) {
  return (
    <AccordionPrimitive.Item value={value} className="border-b border-line">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left font-serif text-lg font-normal text-ink transition hover:text-gold-dark">
          {question}
          <Plus className="size-4 shrink-0 text-ink-muted transition-transform duration-300 group-data-[state=open]:rotate-45" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className={cn("overflow-hidden text-[14px] leading-relaxed text-ink-soft")}>
        <p className="pb-5 pr-10">{answer}</p>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
