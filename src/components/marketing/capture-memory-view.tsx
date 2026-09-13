import { CAPTURE_MEMORY } from "@/lib/marketing/capture-mock-data";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function CaptureMemoryView() {
  const { progress, selected, sections } = CAPTURE_MEMORY;

  return (
    <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold">Plan</h2>
          <span className="tabular text-[11px] font-semibold text-ink-42">
            {progress} %
          </span>
        </div>
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-0.5">
          {sections.map((s) => (
            <li
              key={s.number}
              className={`flex items-start gap-2 rounded-[8px] px-2 py-1.5 text-[12px] ${
                s.number === selected.number
                  ? "bg-brand-wash font-semibold text-brand"
                  : "text-ink-58"
              }`}
            >
              <span className="tabular flex-none font-bold">{s.number}</span>
              <span className="min-w-0 leading-snug">{s.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      <section className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
            {selected.number}. {selected.title}
          </h3>
          <Badge tone="brand">Redige</Badge>
        </div>

        <p className="mt-2 rounded-[10px] border border-line bg-paper px-3 py-2 text-[12px] leading-relaxed text-ink-58">
          <span className="font-semibold text-ink">
            Ce que ce chapitre doit demontrer.
          </span>{" "}
          {selected.brief}
        </p>

        <div className="mt-3 min-h-[180px] rounded-[12px] border border-line bg-white p-3.5 text-[12.5px] leading-relaxed text-ink whitespace-pre-line">
          {selected.content}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Ameliorer", "Raccourcir", "Developper"].map((label) => (
            <span
              key={label}
              className="inline-flex h-8 items-center gap-1.5 rounded-[980px] border border-line bg-white px-3 text-[11.5px] font-medium text-ink-58"
            >
              {label === "Ameliorer" ? (
                <Sparkles className="h-3.5 w-3.5 text-brand" strokeWidth={1.8} />
              ) : null}
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
