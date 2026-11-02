"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors data-[state=checked]:bg-gold data-[state=unchecked]:bg-ink/20",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb className="pointer-events-none block size-[16px] rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-[3px]" />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";
