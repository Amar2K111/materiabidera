import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-deep active:translate-y-px shadow-[0_4px_14px_rgba(0,53,169,0.22)] hover:shadow-[0_6px_20px_rgba(0,53,169,0.28)]",
  ghost: "bg-white text-ink border border-line hover:border-ink",
  subtle: "bg-transparent text-ink-70 hover:bg-paper hover:text-ink",
  danger: "bg-white text-risk border border-risk/30 hover:bg-risk-wash",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[13px] rounded-full",
  md: "h-10 px-5 text-[14px] rounded-full",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "primary", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-colors",
          "disabled:pointer-events-none disabled:opacity-45",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
