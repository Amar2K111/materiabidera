import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "info" | "warn" | "risk";

const TONES: Record<Tone, string> = {
  info: "border-line bg-paper text-ink-70",
  warn: "border-warn/25 bg-warn-wash text-ink-70",
  risk: "border-risk/25 bg-risk-wash text-ink-70",
};

/**
 * Message d'etat lisible par un utilisateur non technique.
 * Aucune erreur brute ne doit remonter jusqu'ici (section 26).
 */
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-[10px] border px-4 py-3", TONES[tone], className)}
      role={tone === "info" ? undefined : "alert"}
    >
      {title ? (
        <p className="text-[13px] font-bold text-ink">{title}</p>
      ) : null}
      {children ? (
        <div className={cn("text-[13px] leading-relaxed", title && "mt-1")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
