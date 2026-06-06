import * as React from "react";
import { cn } from "@/lib/utils/cn";

const fieldClasses =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-faint transition-all duration-150 focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClasses, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClasses, "min-h-24 resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldClasses, "appearance-none bg-background", className)}
    {...props}
  />
));
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-muted", className)}
      {...props}
    />
  );
}
