import Link from "next/link";
import { ArrowRight, FolderPlus } from "lucide-react";
import { listProjectsWithProgress } from "@/lib/data/projects";
import {
  NEXT_STEP,
  PROJECT_STATUS,
  deadlineLabel,
  formatDate,
} from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";

const DECISION = {
  GO: { label: "GO", className: "text-ok" },
  VIGILANCE: { label: "Sous réserve", className: "text-warn" },
  NO_GO: { label: "NO-GO", className: "text-risk" },
} as const;

export default async function DossiersPage() {
  const projects = await listProjectsWithProgress(200);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-ui__page-title">Dossiers</h1>
          <p className="app-ui__page-lead">
            Chaque appel d&apos;offres auquel vous répondez, du dépôt du DCE
            jusqu&apos;à l&apos;export de votre réponse.
          </p>
        </div>
        <ButtonLink href="/app/dossiers/nouveau" className="h-11 flex-none">
          <FolderPlus className="h-4 w-4" strokeWidth={1.9} />
          Nouveau dossier
        </ButtonLink>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderPlus className="h-5 w-5" strokeWidth={1.8} />}
          title="Aucun dossier pour le moment"
          description="Créez un dossier pour déposer un DCE, identifier les exigences, évaluer l'opportunité et construire votre mémoire technique."
          action={
            <ButtonLink href="/app/dossiers/nouveau">Créer un dossier</ButtonLink>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_110px_140px_150px_minmax(0,1.2fr)] gap-4 border-b border-line bg-paper px-5 py-2.5 text-[12px] font-medium text-ink-42 lg:grid">
            <span>Marché</span>
            <span>Acheteur</span>
            <span>Go / No-Go</span>
            <span>Mémoire</span>
            <span>Date limite</span>
            <span>Prochaine action</span>
          </div>

          <ul className="divide-y divide-line-soft">
            {projects.map((p) => {
              const status = PROJECT_STATUS[p.status];
              const due = deadlineLabel(p.deadline);
              const next = NEXT_STEP[p.status];
              const decision = p.recommendation ? DECISION[p.recommendation] : null;

              return (
                <li key={p.id}>
                  <Link
                    href={`/app/dossiers/${p.id}`}
                    className="group grid gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-paper lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_110px_140px_150px_minmax(0,1.2fr)] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="line-clamp-2 text-[14px] leading-snug font-semibold group-hover:text-brand">
                          {p.name}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {p.reference ? (
                          <span className="text-[12px] text-ink-42">{p.reference}</span>
                        ) : null}
                        {p.is_demo ? <Badge>Dossier exemple</Badge> : null}
                      </div>
                    </div>

                    <p className="line-clamp-2 text-[13px] text-ink-70">
                      {p.buyer ?? <span className="text-ink-42">Non renseigné</span>}
                      {p.lot ? (
                        <span className="block text-[12px] text-ink-42">{p.lot}</span>
                      ) : null}
                    </p>

                    <p className="flex items-baseline gap-1.5 text-[13px]">
                      <span className="text-ink-42 lg:hidden">Go / No-Go :</span>
                      <span
                        className={cn(
                          "tabular text-[16px] font-bold",
                          decision ? decision.className : "text-ink-42",
                        )}
                      >
                        {p.score ?? "—"}
                      </span>
                      {decision ? (
                        <span className="text-[11.5px] font-semibold text-ink-58">
                          {decision.label}
                        </span>
                      ) : null}
                    </p>

                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="text-ink-42 lg:hidden">Mémoire :</span>
                      {p.memoryProgress === null ? (
                        <span className="text-ink-42">—</span>
                      ) : (
                        <>
                          <span className="app-ui__bar max-w-[90px]">
                            <i style={{ width: `${p.memoryProgress}%` }} />
                          </span>
                          <span className="tabular text-[12px] font-semibold">
                            {p.memoryProgress} %
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-[13px]">
                      <span className="text-ink-70">{formatDate(p.deadline)}</span>
                      <span
                        className={cn(
                          "block text-[12px]",
                          due.tone === "risk" && "font-semibold text-risk",
                          due.tone === "warn" && "font-semibold text-warn",
                          due.tone === "neutral" && "text-ink-42",
                        )}
                      >
                        {due.text}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand">
                      {next.label}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
