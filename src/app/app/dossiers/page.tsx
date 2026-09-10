import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { listProjects } from "@/lib/data/projects";
import { PROJECT_STATUS, deadlineLabel, formatDate } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function DossiersPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dossiers"
        subtitle="Chaque appel d'offres auquel vous repondez, du depot du DCE jusqu'a l'export de votre reponse."
        action={
          <Link href="/app/dossiers/nouveau">
            <Button className="h-11">+ Nouveau dossier</Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderPlus className="h-5 w-5" strokeWidth={1.8} />}
          title="Aucun dossier pour le moment"
          description="Creez un dossier pour deposer un DCE, identifier les exigences, evaluer l'opportunite et construire votre memoire technique."
          action={
            <Link href="/app/dossiers/nouveau">
              <Button>Creer un dossier</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-line">
          <table className="min-w-[760px]">
            <thead>
              <tr className="border-b border-line bg-paper text-left">
                <Th>Marche</Th>
                <Th>Acheteur</Th>
                <Th>Lot</Th>
                <Th>Date limite</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const status = PROJECT_STATUS[p.status];
                const due = deadlineLabel(p.deadline);

                return (
                  <tr
                    key={p.id}
                    className="border-b border-line-soft last:border-b-0 hover:bg-paper"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/dossiers/${p.id}`}
                        className="text-[13.5px] font-bold hover:text-brand"
                      >
                        {p.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        {p.reference ? (
                          <span className="text-[12px] text-ink-42">
                            {p.reference}
                          </span>
                        ) : null}
                        {p.is_demo ? <Badge tone="neutral">Dossier exemple</Badge> : null}
                      </div>
                    </td>
                    <Td>{p.buyer ?? "Non renseigne"}</Td>
                    <Td>{p.lot ?? "Non renseigne"}</Td>
                    <td className="px-4 py-3">
                      <div className="text-[13px]">{formatDate(p.deadline)}</div>
                      <div
                        className={
                          due.tone === "risk"
                            ? "mt-0.5 text-[12px] font-semibold text-risk"
                            : due.tone === "warn"
                              ? "mt-0.5 text-[12px] font-semibold text-warn"
                              : "mt-0.5 text-[12px] text-ink-42"
                        }
                      >
                        {due.text}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">{children}</th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-[13px] text-ink-70">{children}</td>;
}
