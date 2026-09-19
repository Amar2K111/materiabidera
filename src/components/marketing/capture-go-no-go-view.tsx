import { CAPTURE_GO_NO_GO } from "@/lib/marketing/capture-mock-data";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

type CaptureRecommendation = "GO" | "VIGILANCE" | "NO_GO";

const RECOMMENDATION: Record<
  CaptureRecommendation,
  { label: string; tone: "ok" | "warn" | "risk"; hint: string }
> = {
  GO: { label: "GO", tone: "ok", hint: "Répondre" },
  VIGILANCE: { label: "GO sous réserve", tone: "warn", hint: "Répondre en levant les réserves" },
  NO_GO: { label: "NO-GO", tone: "risk", hint: "Ne pas répondre" },
};

export function CaptureGoNoGoView() {
  const decision = CAPTURE_GO_NO_GO;
  const shown = RECOMMENDATION[decision.recommendation];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div
          className={cn(
            "rounded-[14px] border bg-white p-5 shadow-card",
            shown.tone === "ok" && "border-ok/30",
            shown.tone === "warn" && "border-warn/30",
            shown.tone === "risk" && "border-risk/30",
          )}
        >
          <p className="text-[12px] font-medium text-ink-42">Recommandation</p>
          <p
            className={cn(
              "mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em]",
              shown.tone === "ok" && "text-ok",
              shown.tone === "warn" && "text-warn",
              shown.tone === "risk" && "text-risk",
            )}
          >
            {shown.label}
          </p>
          <p className="text-[12.5px] text-ink-58">{shown.hint}</p>
          <div className="mt-4 flex items-baseline gap-1.5 border-t border-line-soft pt-3">
            <span className="tabular text-[34px] font-bold leading-none tracking-[-0.04em]">
              {decision.score}
            </span>
            <span className="text-[14px] font-semibold text-ink-42">/ 100</span>
          </div>
        </div>

        <div className="rounded-[14px] border border-line bg-white p-5 shadow-card">
          <h2 className="text-[14px] font-semibold">Synthèse</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-70">{decision.summary}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold tracking-[-0.015em]">
          Détail des facteurs
        </h2>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {decision.factors.map((factor) => (
            <li
              key={factor.key}
              className="rounded-[12px] border border-line bg-white p-3.5 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[12.5px] font-semibold">{factor.label}</h3>
                <span className="tabular text-[13px] font-bold">{factor.score}</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-58">
                {factor.justification}
              </p>
              <Badge tone="neutral" className="mt-2">
                {factor.weight} % du score
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <Notice>
        Analyse indicative générée à partir des pièces du dossier et de votre base
        entreprise. La décision finale reste la vôtre.
      </Notice>
    </div>
  );
}
