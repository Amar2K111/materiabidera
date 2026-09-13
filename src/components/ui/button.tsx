import * as React from "react";
import Link from "next/link";
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

/** Classes d'un bouton, reutilisables sur un lien. */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "primary", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={buttonClass({ variant, size, className })}
        {...props}
      />
    );
  },
);

/**
 * Lien presente comme un bouton.
 *
 * Evite d'imbriquer un <button> dans un <a>, ce que le HTML interdit et qui
 * rend la navigation au clavier incoherente.
 */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={buttonClass({ variant, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
