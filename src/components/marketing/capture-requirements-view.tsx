import {
  CAPTURE_REQUIREMENTS,
} from "@/lib/marketing/capture-mock-data";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  sourceLabel,
} from "@/lib/requirements";
import { Badge } from "@/components/ui/badge";

export function CaptureRequirementsView() {
  const requirements = CAPTURE_REQUIREMENTS;
  const counts = { COVERED: 2, TO_HANDLE: 1, MISSING: 1 };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Exigences", value: "4" },
          { label: "Couvertes", value: String(counts.COVERED), tone: "ok" },
          { label: "A traiter", value: String(counts.TO_HANDLE), tone: "warn" },
          { label: "Manquantes", value: String(counts.MISSING), tone: "risk" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-[12px] bg-paper px-3 py-2.5 text-center"
          >
            <p
              className={`tabular text-[18px] font-bold tracking-[-0.03em] ${
                m.tone === "ok"
                  ? "text-ok"
                  : m.tone === "warn"
                    ? "text-warn"
                    : m.tone === "risk"
                      ? "text-risk"
                      : "text-ink"
              }`}
            >
              {m.value}
            </p>
            <p className="text-[11px] font-medium text-ink-58">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[12px] border border-line">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-line bg-paper text-left">
              <th className="px-3 py-2.5 text-[11px] font-semibold text-ink-58">
                Exigence
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-ink-58">
                Source
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-ink-58">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((r) => (
              <tr key={r.id} className="border-b border-line-soft last:border-b-0">
                <td className="px-3 py-2.5">
                  <p className="max-w-[34ch] text-[12.5px] font-medium leading-snug">
                    {r.text}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-42">
                    {CATEGORY_LABELS[r.category]} · {PRIORITY_LABELS[r.priority]}
                  </p>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-ink-58">
                  {r.requirement_sources[0]
                    ? sourceLabel(r.requirement_sources[0])
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <Badge tone={STATUS_LABELS[r.status].tone}>
                    {STATUS_LABELS[r.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
