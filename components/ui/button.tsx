import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-[11px] font-medium uppercase tracking-label transition-all duration-300 ease-luxe disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-full bg-ink px-7 py-3.5 text-cream hover:bg-ink-soft",
        outline: "rounded-full border border-ink/25 bg-transparent px-7 py-3.5 text-ink hover:border-ink hover:bg-ink hover:text-cream",
        light: "rounded-full bg-cream-50 px-7 py-3.5 text-ink hover:bg-white",
        gold: "rounded-full bg-gold px-7 py-3.5 text-white hover:bg-gold-dark",
        ghost: "rounded-full px-4 py-2.5 text-ink hover:bg-ink/5",
        link: "px-0 py-0 text-ink underline-offset-4 hover:underline",
        destructive: "rounded-full bg-red-700 px-6 py-3 text-white hover:bg-red-800",
        subtle: "rounded-full border border-line bg-white/60 px-5 py-2.5 text-ink hover:border-gold hover:text-gold-dark",
      },
      size: {
        default: "",
        sm: "px-5 py-2.5 text-[10px]",
        lg: "px-9 py-4 text-[11.5px]",
        icon: "h-9 w-9 rounded-full p-0",
        none: "p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
