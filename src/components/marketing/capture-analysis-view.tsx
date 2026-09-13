import { CAPTURE_ANALYSIS } from "@/lib/marketing/capture-mock-data";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";

export function CaptureAnalysisView() {
  const analysis = CAPTURE_ANALYSIS;

  return (
    <div className="space-y-5">
      <Notice>
        Analyse indicative produite par MateriaBTP a partir du DCE depose.
        Verifiez chaque element avant de vous en servir.
      </Notice>

      <Card>
        <CardHeader>
          <CardTitle>Informations cles</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Objet du marche" value={analysis.subject} />
          <Field label="Acheteur" value={analysis.buyer} />
          <Field label="Lot" value={analysis.lot} />
          <Field label="Montant" value={analysis.amount} />
          <Field label="Duree" value={analysis.duration} />
          <Field label="Date limite de remise" value={analysis.submission_date} />
        </CardBody>
      </Card>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold tracking-[-0.015em]">
          Criteres d&apos;attribution
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
