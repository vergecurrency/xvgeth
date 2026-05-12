import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  default:
    "farm-button-default text-slate-950 hover:brightness-105 disabled:text-slate-400",
  secondary:
    "farm-button-secondary text-slate-100 disabled:text-slate-500",
  outline:
    "farm-button-outline border text-slate-100 disabled:text-slate-500",
};

export function buttonVariants(variant: ButtonVariant = "default", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-2xl px-4 text-sm font-medium shadow-[var(--farm-button-shadow)] transition-all duration-200 hover:-translate-y-0.5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--farm-focus-ring)]",
    "disabled:cursor-not-allowed disabled:shadow-none",
    variants[variant],
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonVariants(variant, className)} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
