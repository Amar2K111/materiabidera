"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export type TabItem = { href: string; label: string };

/** Navigation secondaire, defilable horizontalement sur petit ecran. */
export function TabNav({
  items,
  ariaLabel,
}: {
  items: TabItem[];
  ariaLabel: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-4 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0"
      aria-label={ariaLabel}
    >
      <ul className="flex min-w-max gap-1">
        {items.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px block border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-58 hover:text-ink",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
