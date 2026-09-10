import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "brand" | "ok" | "warn" | "risk";

const TONES: Record<Tone, string> = {
  neutral: "text-ink",
  brand: "text-brand",
  ok: "text-ok",
  warn: "text-warn",
  risk: "text-risk",
};

export type Metric = {
  label: string;
  value: string;
  tone?: Tone;
};

/** Bandeau de metriques, repris du vocabulaire visuel de la landing page. */
export function MetricRow({ items }: { items: Metric[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-line sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => (
        <div
          key={m.label}
          className="border-b border-r border-line px-4 py-3 last:border-r-0"
        >
          <b
            className={cn(
              "tabular block text-[22px] leading-tight font-extrabold tracking-[-0.04em]",
              TONES[m.tone ?? "neutral"],
            )}
          >
            {m.value}
          </b>
          <span className="mt-0.5 block text-[11.5px] font-semibold text-ink-42">
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}
