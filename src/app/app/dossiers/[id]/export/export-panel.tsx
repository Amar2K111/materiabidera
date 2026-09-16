"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FileType2,
  Info,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ExportRecord } from "@/lib/data/quality";
import type { ExportCheckReport } from "@/lib/export/checks";
import type { ResponseFormat } from "@/lib/requirements";
import { formatBytes } from "@/lib/documents";
import { formatDateTime } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { triggerDownload } from "@/lib/utils/browser-file";
import { cn } from "@/lib/utils/cn";
import { PdfPreview } from "./pdf-preview";

type Busy = "DOCX" | "PDF" | "preview" | null;

type Report = { label: string; checks: ExportCheckReport };

export function ExportPanel({
  projectId,
  exports,
  writtenCount,
  totalCount,
  remaining,
  responseFormat,
}: {
  projectId: string;
  exports: ExportRecord[];
  writtenCount: number;
  totalCount: number;
  remaining: number;
  responseFormat: ResponseFormat | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [includeSources, setIncludeSources] = useState(false);
  const [includeAnnexes, setIncludeAnnexes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [preview, setPreview] = useState<{ url: string; pages: number; data: Uint8Array } | null>(null);

  // L'apercu est un fichier en memoire : il est libere quand il est remplace.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const options = { includeSources, includeAnnexes };

  async function run(format: "DOCX" | "PDF") {
    setBusy(format);
    setError(null);
    setDone(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, ...options }),
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
      setReport({
        label: format === "DOCX" ? "Word" : "PDF",
        checks: payload.result.checks,
      });
    } catch {
      setError("L'export n'a pas pu aboutir. Merci de relancer.");
      setBusy(null);
      return;
    }

    setBusy(null);
    router.refresh();
  }

  async function showPreview() {
    setBusy("preview");
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/export/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "L'aperçu n'a pas pu être produit.");
        setBusy(null);
        return;
      }

      const bytes = Uint8Array.from(atob(payload.preview.pdfBase64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      setPreview({ url, pages: payload.preview.pages, data: bytes });
      setReport({ label: "Aperçu", checks: payload.preview.checks });
    } catch {
      setError("L'aperçu n'a pas pu être produit. Merci de réessayer.");
    }
    setBusy(null);
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

  const constraints = responseFormat
    ? [
        responseFormat.imposedFramework && responseFormat.structure.length > 0
          ? `Cadre de réponse imposé : ${responseFormat.structure.join(" ; ")}.`
          : responseFormat.imposedFramework
            ? "Un cadre de réponse est imposé par le DCE."
            : null,
        responseFormat.pageLimit ? `Limite : ${responseFormat.pageLimit}.` : null,
        ...responseFormat.constraints,
      ].filter((c): c is string => Boolean(c))
    : [];

  return (
    <div className="space-y-6">
      {writtenCount < totalCount ? (
        <Notice tone="warn" title="Le mémoire est incomplet">
          {writtenCount} chapitre{writtenCount > 1 ? "s" : ""} rédigé
          {writtenCount > 1 ? "s" : ""} sur {totalCount}. Les chapitres vides
          apparaîtront dans le document avec la mention « Chapitre non rédigé ».
        </Notice>
      ) : null}

      {constraints.length > 0 ? (
        <Notice tone="warn" title="Cadre de réponse et pièces demandées par le DCE">
          <p>
            Ces exigences priment sur la mise en page par défaut. Vérifiez que le
            plan du mémoire et votre dossier de remise les respectent.
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-4">
            {constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
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

      {report ? <CheckReport report={report} onClose={() => setReport(null)} /> : null}

      <section className="rounded-[14px] border border-line bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
              Mémoire technique prêt à déposer
            </h2>
            <p className="mt-1.5 max-w-[75ch] text-[13.5px] leading-relaxed text-ink-58">
              Couverture, sommaire paginé, chapitres numérotés, tableaux, en-têtes
              et pagination. Le Word et le PDF sont deux formats du même document ;
              chaque fichier est contrôlé avant d&apos;être livré.
            </p>
          </div>
          <Button
            variant="ghost"
            className="flex-none"
            onClick={showPreview}
            disabled={busy !== null}
          >
            {busy === "preview" ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.9} />
            )}
            {busy === "preview" ? "Préparation de l'aperçu…" : "Aperçu du document"}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <FormatCard
            title="Word (.docx)"
            detail="Entièrement modifiable : styles de titre, tableaux et sommaire natifs."
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

        <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
          <Option
            checked={includeAnnexes}
            onChange={setIncludeAnnexes}
            title="Joindre les annexes"
            detail="Tableaux des références et certifications citées dans le mémoire, issues de votre base entreprise."
          />
          <Option
            checked={includeSources}
            onChange={setIncludeSources}
            title="Inclure les sources en fin de chapitre"
            detail="Pour votre relecture interne. À décocher pour le document remis à l'acheteur."
          />
        </div>
      </section>

      {preview ? (
        <section className="overflow-hidden rounded-[14px] border border-line bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
            <p className="text-[14px] font-semibold">
              Aperçu du document final
              <span className="ml-2 text-[12.5px] font-normal text-ink-42">
                {preview.pages} pages
              </span>
            </p>
            <div className="flex gap-2">
              <a
                href={preview.url}
                target="_blank"
                rel="noopener"
                className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px] font-semibold text-ink-70 hover:border-ink-42"
              >
                Ouvrir en plein écran
              </a>
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)} aria-label="Fermer l'aperçu">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </Button>
            </div>
          </div>
          <PdfPreview data={preview.data} />
        </section>
      ) : null}

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

/** Resultat du controle de mise en page, du plus grave au simple constat. */
function CheckReport({ report, onClose }: { report: Report; onClose: () => void }) {
  const { checks } = report;
  const errors = checks.items.filter((i) => i.level === "error");
  const warnings = checks.items.filter((i) => i.level === "warning");
  const infos = checks.items.filter((i) => i.level === "info");
  const clean = errors.length === 0 && warnings.length === 0;

  return (
    <section
      className={cn(
        "rounded-[14px] border bg-white p-5 shadow-card",
        errors.length > 0 ? "border-risk/30" : warnings.length > 0 ? "border-warn/35" : "border-ok/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-[14.5px] font-semibold">
          {clean ? (
            <ShieldCheck className="h-4 w-4 text-ok" strokeWidth={2} />
          ) : (
            <TriangleAlert className={cn("h-4 w-4", errors.length ? "text-risk" : "text-warn")} strokeWidth={2} />
          )}
          Contrôle de mise en page ({report.label})
          {checks.pages ? <span className="font-normal text-ink-42"> · {checks.pages} pages</span> : null}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le contrôle"
          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-ink-42 hover:bg-paper hover:text-ink"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      <p className="mt-1 text-[13px] text-ink-58">
        {clean
          ? "Aucune page blanche, aucun texte hors page, en-têtes, pagination et sommaire cohérents, aucun contenu interne visible."
          : errors.length > 0
            ? "Des défauts ont été relevés : corrigez-les avant de déposer ce document."
            : "Le document est présentable ; quelques points méritent votre attention."}
      </p>
      {[...errors, ...warnings, ...infos].length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {[...errors, ...warnings, ...infos].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed">
              {item.level === "info" ? (
                <Info className="mt-0.5 h-3.5 w-3.5 flex-none text-ink-42" strokeWidth={2} />
              ) : (
                <TriangleAlert
                  className={cn("mt-0.5 h-3.5 w-3.5 flex-none", item.level === "error" ? "text-risk" : "text-warn")}
                  strokeWidth={2}
                />
              )}
              <span className={item.level === "info" ? "text-ink-58" : "text-ink-70"}>{item.message}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Option({
  checked,
  onChange,
  title,
  detail,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  detail: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-[10px] bg-paper px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-none accent-[#0035A9]"
      />
      <span className="text-[13px] leading-relaxed">
        <span className="font-semibold">{title}</span>
        <span className="block text-ink-58">{detail}</span>
      </span>
    </label>
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
        "flex flex-wrap items-center gap-4 rounded-[12px] border p-4",
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
