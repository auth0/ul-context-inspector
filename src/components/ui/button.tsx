import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "uci-inline-flex uci-items-center uci-gap-2 uci-whitespace-nowrap uci-rounded-md uci-text-sm uci-font-medium uci-ring-offset-background uci-transition-colors focus-visible:uci-outline-none focus-visible:uci-ring-2 focus-visible:uci-ring-ring focus-visible:uci-ring-offset-2 disabled:uci-pointer-events-none [&_svg]:uci-pointer-events-none [&_svg]:uci-size-4 [&_svg]:uci-shrink-0",
  {
    variants: {
      variant: {
        default:
          "uci-bg-primary uci-text-primary-foreground hover:uci-bg-primary/90",
        destructive:
          "uci-bg-destructive uci-text-destructive-foreground hover:uci-bg-destructive/90",
        outline:
          "uci-border uci-bg-background hover:uci-bg-accent hover:uci-text-white",
        secondary:
          "uci-bg-secondary uci-text-secondary-foreground hover:uci-bg-secondary/80",
        ghost: "hover:uci-bg-accent hover:uci-text-accent-foreground",
        link: "uci-text-primary uci-underline-offset-4 hover:uci-underline"
      },
      size: {
        default: "uci-h-9 uci-px-4 uci-py-2",
        sm: "uci-h-9 uci-rounded-md uci-px-3",
        lg: "uci-h-11 uci-rounded-md uci-px-8",
        icon: "uci-h-10 uci-w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
