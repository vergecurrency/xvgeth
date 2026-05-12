import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-blue-100/18 bg-[linear-gradient(180deg,rgba(7,18,64,0.82),rgba(11,37,126,0.68))] p-4 text-slate-200 shadow-[0_20px_60px_rgba(2,6,23,0.28),0_0_24px_rgba(37,99,235,0.08)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6", className)} {...props} />;
}
