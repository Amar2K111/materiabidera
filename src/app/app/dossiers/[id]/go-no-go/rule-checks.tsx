import Link from "next/link";
import { ArrowRight, Calculator, CircleCheck, CircleHelp, CircleX } from "lucide-react";
import type { RuleCheck, RuleStatus } from "@/lib/qualification";
import { Sources } from "@/components/app/sources";
import { cn } from "@/lib/utils/cn";

const STATUS: Record<
  RuleStatus,
  { label: string; tone: "ok" | "risk" | "warn"; Icon: typeof CircleCheck }
> = {
  RESPECTED: { label: "Respecté", tone: "ok", Icon: CircleCheck },
  VIOLATED: { label: "Non respecté", tone: "risk", Icon: CircleX },
  UNKNOWN: { label: "À vérifier", tone: "warn", Icon: CircleHelp },
};

/**
 * Verdict des criteres de qualification de l'entreprise pour cette
 * consultation. Chaque verdict porte ses sources, comme les facteurs.
 *
 * configured : nombre de criteres fixes aujourd'hui, ou null si la
 * fonctionnalite n'est pas encore disponible (migration 0011).
 */
export function RuleChecks({
  checks,
  configured,
}: {
  checks: RuleCheck[];
  configured: number | null;
}) {
  if (configured === null) return null;

  // Aucun critere : on signale simplement que la grille existe.
  if (checks.length === 0) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-dashed border-line bg-white px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold">Vos critères de qualification</h2>
          <p className="mt-0.5 text-[13px] text-ink-58">
            {configured > 0
              ? `Vous avez fixé ${configured} critère${configured > 1 ? "s" : ""} depuis cette évaluation : relancez-la pour les vérifier sur ce dossier.`
              : "Montant minimum, zone d'intervention, pénalités acceptables… Fixez vos règles une fois : elles seront vérifiées à chaque évaluation."}
          </p>
        </div>
        <Link
          href="/app/parametres#criteres"
          className="inline-flex flex-none items-center gap-1.5 text-[13px] font-semibold text-brand underline-offset-4 hover:underline"
        >
          {configured > 0 ? "Voir mes critères" : "Définir mes critères"}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </section>
    );
  }

  const eliminating = checks.filter((c) => c.blocking && c.status === "VIOLATED");
  const respected = checks.filter((c) => c.status === "RESPECTED").length;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
          Vos critères de qualification
        </h2>
        <p className="text-[12.5px] text-ink-58">
          {respected} sur {checks.length} respecté{respected > 1 ? "s" : ""} ·{" "}
          <Link
            href="/app/parametres#criteres"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Modifier mes critères
          </Link>
        </p>
      </div>

      {eliminating.length > 0 ? (
        <p className="mb-3 rounded-[10px] border border-risk/25 bg-risk-wash px-4 py-3 text-[13px] leading-relaxed text-ink-70">
          <b className="font-semibold text-risk">
            {eliminating.length > 1
              ? `${eliminating.length} critères éliminatoires ne sont pas respectés`
              : "Un critère éliminatoire n'est pas respecté"}
          </b>{" "}
          : la recommandation est NO-GO, quelle que soit la note d&apos;opportunité.
          Vous pouvez toujours trancher autrement ci-dessous.
        </p>
      ) : null}

      <ul className="divide-y divide-line-soft overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
        {checks.map((check) => {
          const s = STATUS[check.status];
          return (
            <li key={check.ruleId} className="flex gap-3 px-4 py-3.5 sm:px-5">
              <s.Icon
                className={cn(
                  "mt-0.5 h-[18px] w-[18px] flex-none",
                  s.tone === "ok" && "text-ok",
                  s.tone === "risk" && "text-risk",
                  s.tone === "warn" && "text-warn",
                )}
                strokeWidth={2}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[13.5px] leading-snug font-semibold">{check.text}</p>
                  {check.blocking ? (
                    <span className="rounded-[5px] bg-ink/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-ink-70">
                      Éliminatoire
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      s.tone === "ok" && "text-ok",
                      s.tone === "risk" && "text-risk",
                      s.tone === "warn" && "text-warn",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-70">
                  {check.justification}
                </p>
                {check.automatic ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-ink-58">
                    <Calculator className="h-3 w-3" strokeWidth={2} aria-hidden />
                    Calculé par MateriaBTP à partir de la date limite du dossier
                  </p>
                ) : (
                  <Sources sources={check.sources} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
