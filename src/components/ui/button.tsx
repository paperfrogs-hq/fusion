import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-primary/15 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(182,255,0,0.22)] hover:bg-[#C8FF2F] hover:shadow-[0_0_28px_-10px_rgba(182,255,0,0.82)]",
        destructive: "border border-red-500/40 bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-primary/65 bg-transparent text-primary hover:border-[#C8FF2F] hover:bg-primary/10 hover:text-[#C8FF2F]",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "border border-primary/20 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(182,255,0,0.25)] hover:bg-[#C8FF2F] hover:shadow-[0_0_28px_-10px_rgba(182,255,0,0.85)]",
        "hero-outline": "border border-primary/65 bg-transparent text-primary hover:border-[#C8FF2F] hover:bg-primary/10 hover:text-[#C8FF2F]",
        glow: "relative border border-primary/20 bg-primary text-primary-foreground shadow-[0_0_30px_-12px_rgba(182,255,0,0.85)]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
