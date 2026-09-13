"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileText, FileType2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ExportRecord } from "@/lib/data/quality";
import { formatBytes } from "@/lib/documents";
import { formatDateTime } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { triggerDownload } from "@/lib/utils/browser-file";
import { cn } from "@/lib/utils/cn";

export function ExportPanel({
  projectId,
  exports,
  writtenCount,
  totalCount,
  remaining,
}: {
  projectId: string;
  exports: ExportRecord[];
  writtenCount: number;
  totalCount: number;
  remaining: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"DOCX" | "PDF" | null>(null);
  const [includeSources, setIncludeSources] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function run(format: "DOCX" | "PDF") {
    setBusy(format);
    setError(null);
    setDone(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, includeSources }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "L'export n'a pas pu aboutir.");
        setBusy(null);
        return;
      }

      // Le lien est servi en piece jointe : le fichier s'enregistre sans
      // quitter la page.
      triggerDownload(payload.result.url);
      setDone(payload.result.fileName);
    } catch {
      setError("L'export n'a pas pu aboutir. Merci de relancer.");
      setBusy(null);
      return;
    }

    setBusy(null);
    router.refresh();
  }

  async function download(record: ExportRecord) {
    setError(null);
    const supabase = createClient();
    const { data, error: signError } = await supabase.storage
      .from("exports")
      .createSignedUrl(record.storage_path, 300, { download: record.file_name });

    if (signError || !data) {
      setError("Ce document n'a pas pu être téléchargé.");
      return;
    }
    triggerDownload(data.signedUrl);
  }

  return (
    <div className="space-y-6">
      {writtenCount < totalCount ? (
        <Notice tone="warn" title="Le mémoire est incomplet">
          {writtenCount} chapitre{writtenCount > 1 ? "s" : ""} rédigé
          {writtenCount > 1 ? "s" : ""} sur {totalCount}. Les chapitres vides
          apparaîtront dans le document avec la mention « Chapitre non rédigé ».
        </Notice>
      ) : null}

      {remaining > 0 ? (
        <Notice
          tone="warn"
          title={`${remaining} point${remaining > 1 ? "s" : ""} de checklist ouvert${remaining > 1 ? "s" : ""}`}
        >
          <p>
            Vous pouvez exporter, mais la checklist avant remise n&apos;est pas
            entièrement satisfaite.
          </p>
          <ButtonLink
            href={`/app/dossiers/${projectId}/checklist`}
            variant="ghost"
            size="sm"
            className="mt-3"
          >
            Voir la checklist
          </ButtonLink>
        </Notice>
      ) : null}

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {done ? (
        <div className="flex items-center gap-2.5 rounded-[12px] border border-ok/25 bg-ok-wash px-4 py-3 text-[13.5px] font-medium text-ok">
          <CheckCircle2 className="h-4 w-4 flex-none" strokeWidth={2} />
          Export terminé : {done}
        </div>
      ) : null}

      <section className="rounded-[14px] border border-line bg-white p-6 shadow-card">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
          Télécharger le mémoire technique
        </h2>
        <p className="mt-1.5 max-w-[75ch] text-[13.5px] leading-relaxed text-ink-58">
          Couverture, sommaire, titres hiérarchisés, en-têtes et pagination. Le
          fichier Word conserve de vrais styles de titre : le sommaire s&apos;y
          met à jour et le volet de navigation reste utilisable.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <FormatCard
            title="Word (.docx)"
            detail="Pour relire, compléter et mettre en forme avant dépôt."
            icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
            busy={busy === "DOCX"}
            disabled={busy !== null}
            onClick={() => run("DOCX")}
            primary
          />
          <FormatCard
            title="PDF"
            detail="Version figée, prête à être déposée sur la plateforme."
            icon={<FileType2 className="h-5 w-5" strokeWidth={1.8} />}
            busy={busy === "PDF"}
            disabled={busy !== null}
            onClick={() => run("PDF")}
          />
        </div>

        <label className="mt-5 flex max-w-[75ch] cursor-pointer items-start gap-2.5 rounded-[10px] bg-paper px-4 py-3">
          <input
            type="checkbox"
            checked={includeSources}
            onChange={(e) => setIncludeSources(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none accent-[#0035A9]"
          />
          <span className="text-[13px] leading-relaxed">
            <span className="font-semibold">
              Inclure les sources en fin de chapitre
            </span>
            <span className="block text-ink-58">
              Utile pour votre relecture interne. À décocher pour le document
              remis à l&apos;acheteur, sauf si le règlement le demande.
            </span>
          </span>
        </label>
      </section>

      {exports.length > 0 ? (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Exports précédents</h2>
          <ul className="divide-y divide-line-soft overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
            {exports.map((record) => (
              <li key={record.id} className="flex items-center gap-3 px-4 py-3">
                <FileText className="h-4 w-4 flex-none text-ink-42" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium" title={record.file_name}>
                    {record.file_name}
                  </p>
                  <p className="text-[12px] text-ink-42">
                    {[
                      formatDateTime(record.created_at),
                      record.size_bytes ? formatBytes(record.size_bytes) : null,
                      record.section_count
                        ? `${record.section_count} chapitre${record.section_count > 1 ? "s" : ""}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Badge>{record.format === "DOCX" ? "Word" : "PDF"}</Badge>
                <button
                  type="button"
                  onClick={() => download(record)}
                  aria-label={`Télécharger ${record.file_name}`}
                  title="Télécharger"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
                >
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function FormatCard({
  title,
  detail,
  icon,
  busy,
  disabled,
  onClick,
  primary,
}: {
  title: string;
  detail: string;
  icon: React.ReactNode;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[12px] border p-4",
        primary ? "border-brand/25 bg-brand-wash/50" : "border-line",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 flex-none items-center justify-center rounded-[10px]",
          primary ? "bg-brand text-white" : "bg-paper text-ink-58",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-[12.5px] text-ink-58">{detail}</p>
      </div>
      <Button
        variant={primary ? "primary" : "ghost"}
        size="sm"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Télécharger ${title}`}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.9} />
        ) : (
          <Download className="h-3.5 w-3.5" strokeWidth={1.9} />
        )}
        {busy ? "Préparation…" : "Télécharger"}
      </Button>
    </div>
  );
}
