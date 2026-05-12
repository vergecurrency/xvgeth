import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "farm-input flex h-11 w-full rounded-2xl border px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--farm-focus-ring)] focus-visible:border-[var(--farm-card-border-strong)]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
