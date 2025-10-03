import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ children, className, ...props }: React.ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn(
        "uci-flex uci-items-center uci-gap-2 uci-text-sm uci-leading-none uci-font-medium uci-select-none group-data-[disabled=true]:uci-pointer-events-none group-data-[disabled=true]:uci-opacity-50 peer-disabled:uci-cursor-not-allowed peer-disabled:uci-opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
