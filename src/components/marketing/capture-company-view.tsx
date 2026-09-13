import { COLLECTIONS } from "@/lib/company";
import { CAPTURE_COMPANY_COUNTS } from "@/lib/marketing/capture-mock-data";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export function CaptureCompanyView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
          Base entreprise
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-58">
          La memoire permanente de votre entreprise. References, moyens,
          certifications et methodes reutilisables dans chaque memoire.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etat de votre base</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="grid gap-2 sm:grid-cols-2">
            {COLLECTIONS.map((c) => {
              const count = CAPTURE_COMPANY_COUNTS[c.table] ?? 0;
              return (
                <li key={c.slug}>
                  <div className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-white px-3 py-2.5">
                    <span className="text-[13px] font-medium">{c.title}</span>
                    <span className="tabular rounded-full bg-brand-wash px-2 py-0.5 text-[12px] font-bold text-brand">
                      {count}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <div className="rounded-[12px] border border-line bg-paper p-3.5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-42">
          Exemple — Reference
        </p>
        <p className="mt-1 text-[13px] font-semibold">
          Rehabilitation ecole Jean Moulin — Lyon
        </p>
        <p className="mt-1 text-[12px] text-ink-58">
          Client : Ville de Lyon · 2024 · 1,24 M EUR HT · Chantier occupe
        </p>
      </div>
    </div>
  );
}
