import { CAPTURE_ANALYSIS } from "@/lib/marketing/capture-mock-data";
import { Sources } from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const SEVERITY = {
  HIGH: { label: "Critique", tone: "risk" as const },
  MEDIUM: { label: "À surveiller", tone: "warn" as const },
  LOW: { label: "Pour information", tone: "neutral" as const },
};

export function CaptureAnalysisView({ compact = false }: { compact?: boolean }) {
  const analysis = CAPTURE_ANALYSIS;

  return (
    <div className="space-y-5">
      {!compact ? (
        <Notice>
          Analyse indicative produite par MateriaBTP à partir du DCE déposé.
          Vérifiez chaque élément avant de vous en servir.
        </Notice>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Informations clés</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Objet du marché" value={analysis.subject} />
          <Field label="Acheteur" value={analysis.buyer} />
          <Field label="Lot" value={analysis.lot} />
          {!compact ? (
            <>
              <Field label="Montant" value={analysis.amount} />
              <Field label="Durée" value={analysis.duration} />
            </>
          ) : null}
          <Field label="Date limite de remise" value={analysis.submission_date} />
        </CardBody>
      </Card>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold tracking-[-0.015em]">
          Critères d&apos;attribution
        </h2>
        <ul className="space-y-2">
          {analysis.award_criteria.map((c) => (
            <li
              key={c.label}
              className="rounded-[12px] border border-line bg-white p-3.5 shadow-card"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13px] font-semibold">{c.label}</h3>
                <span className="tabular text-[14px] font-bold text-brand">
                  {c.weight}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-70">
                {c.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold tracking-[-0.015em]">
          Points de vigilance
        </h2>
        <ul className="space-y-2.5">
          {analysis.vigilance_points.map((point, index) => (
            <li
              key={`${point.title}-${index}`}
              className={cn(
                "rounded-[12px] border border-line border-l-[3px] bg-white p-3.5 shadow-card",
                point.severity === "HIGH" && "border-l-risk",
                point.severity === "MEDIUM" && "border-l-warn",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13px] font-semibold leading-snug">{point.title}</h3>
                <Badge tone={SEVERITY[point.severity].tone} className="flex-none">
                  {SEVERITY[point.severity].label}
                </Badge>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-70">
                {point.detail}
              </p>
              <Sources sources={point.sources} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11.5px] font-semibold text-ink-42">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium">{value}</p>
    </div>
  );
}
