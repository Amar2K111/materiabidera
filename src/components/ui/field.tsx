import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[8px] border border-line bg-white px-3 text-[14px]",
        "placeholder:text-ink-42 focus:border-brand focus:outline-none",
        "disabled:bg-paper disabled:text-ink-42",
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-[8px] border border-line bg-white px-3 py-2 text-[14px] leading-relaxed",
        "placeholder:text-ink-42 focus:border-brand focus:outline-none",
        className,
      )}
      {...props}
    />
  );
});

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-semibold", className)}
      {...props}
    />
  );
}

export function FieldHint({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1.5 text-[12.5px] text-ink-42", className)} {...props} />
  );
}
