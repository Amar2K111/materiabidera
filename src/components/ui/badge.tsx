import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "brand" | "ok" | "warn" | "risk";

const TONES: Record<Tone, string> = {
  neutral: "border-line text-ink-58 bg-white",
  brand: "border-brand/20 text-brand bg-brand-wash",
  ok: "border-ok/20 text-ok bg-ok-wash",
  warn: "border-warn/20 text-warn bg-warn-wash",
  risk: "border-risk/20 text-risk bg-risk-wash",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2.5",
        "text-[11.5px] font-bold whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
