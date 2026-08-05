import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Styled native <select> — keyboard/mobile friendly with a proper chevron.
 * Size the wrapper via className (e.g. "w-40" or "w-full").
 */
export function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & { className?: string }) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <select
        {...props}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm shadow-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </span>
  );
}
