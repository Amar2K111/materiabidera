import Link from "next/link";
import { type ComponentPropsWithoutRef } from "react";

type ArrowLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  showArrow?: boolean;
};

export function ArrowLink({ children, className = "", showArrow = true, ...props }: ArrowLinkProps) {
  return (
    <Link className={`arrow-link inline-flex items-center gap-1.5 ${className}`} {...props}>
      {children}
      {showArrow && (
        <span className="arrow" aria-hidden="true">
          →
        </span>
      )}
    </Link>
  );
}
