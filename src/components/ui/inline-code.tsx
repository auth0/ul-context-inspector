import * as React from "react";
import { cn } from "@/lib/utils";

export interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export default function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        "uci-bg-[#4f46e5] theme-default:uci-bg-secondary uci-relative uci-rounded-lg uci-px-[0.35rem] uci-py-[0.2rem] uci-font-mono uci-text-sm uci-font-medium uci-tracking-tight",
        className
      )}
    >
      {children}
    </code>
  );
}
