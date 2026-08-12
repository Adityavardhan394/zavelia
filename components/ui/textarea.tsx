import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[100px] w-full rounded-md border border-[var(--color-champagne)] bg-white px-3 py-2 text-sm text-[var(--color-espresso)] placeholder:text-[var(--color-espresso)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose-gold)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
