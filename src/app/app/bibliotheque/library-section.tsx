"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Library, Loader2, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CompanyDocument } from "@/lib/data/company";
import { formatBytes, guessCompanyKindFromName } from "@/lib/documents";
import { formatDateTime } from "@/lib/projects";
import { DocumentUploader } from "@/components/app/document-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";
import { openInTab, reserveTab } from "@/lib/utils/browser-file";

type Kind = CompanyDocument["kind"];

const KIND_LABELS: Record<Kind, string> = {
  REFERENCE: "Références",
  MEMOIRE: "Mémoires",
  METHODE: "Méthodes",
  CV: "CV",
  CERTIFICATION: "Certifications",
  QSE: "QSE",
  MATERIEL: "Matériel",
  AUTRE: "Autres",
};

const KINDS = Object.keys(KIND_LABELS) as Kind[];

export function LibrarySection({
  organizationId,
  documents,
}: {
  organizationId: string;
  documents: CompanyDocument[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Kind | "ALL">("ALL");
  const [showUploader, setShowUploader] = useState(documents.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  const counts = useMemo(() => {
    const base = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<
      Kind,
      number
    >;
    for (const d of documents) base[d.kind] += 1;
    return base;
  }, [documents]);

  const visible =
    filter === "ALL" ? documents : documents.filter((d) => d.kind === filter);

  const pending = documents.filter((d) => d.status === "UPLOADED").length;

  /** Lit les pieces en attente, une par une, jusqu'a epuisement. */
  async function readPending() {
    setReading(true);
    setError(null);

    for (let guard = 0; guard < 200; guard += 1) {
      try {
        const response = await fetch("/api/company/ingest", { method: "POST" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        router.refresh();
        if (!payload.processed || payload.remaining === 0) break;
      } catch {
        setError(
          "La lecture des documents a été interrompue. Relancez-la dans un instant.",
        );
        break;
      }
    }

    setReading(false);
    router.refresh();
  }

  async function changeKind(doc: CompanyDocument, kind: Kind) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("company_documents")
      .update({ kind })
      .eq("id", doc.id);

    if (updateError) {
      setError("La catégorie n'a pas pu être modifiée.");
      return;
    }
    router.refresh();
  }

  async function remove(doc: CompanyDocument) {
    setError(null);
    const supabase = createClient();

    const { error: storageError } = await supabase.storage
      .from("entreprise")
      .remove([doc.storage_path]);

    if (storageError) {
      setError("Le document n'a pas pu être supprimé.");
      return;
    }

    await supabase.from("company_documents").delete().eq("id", doc.id);
    router.refresh();
  }

  async function download(doc: CompanyDocument) {
    setError(null);
    // L'onglet est ouvert pendant le clic, sinon le navigateur le bloque.
    const tab = reserveTab();
    const supabase = createClient();
    // Lien signe de courte duree : le bucket reste prive.
    const { data, error: signError } = await supabase.storage
      .from("entreprise")
      .createSignedUrl(doc.storage_path, 60);

    if (signError || !data) {
      tab?.close();
      setError("Le document n'a pas pu être ouvert.");
      return;
    }
    openInTab(tab, data.signedUrl);
  }


  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            label={`Tous (${documents.length})`}
          />
          {KINDS.filter((k) => counts[k] > 0).map((k) => (
            <Chip
              key={k}
              active={filter === k}
              onClick={() => setFilter(k)}
              label={`${KIND_LABELS[k]} (${counts[k]})`}
            />
          ))}
        </div>

        {documents.length > 0 ? (
          <Button
            type="button"
            variant={showUploader ? "ghost" : "primary"}
            onClick={() => setShowUploader((v) => !v)}
          >
            {showUploader ? (
              <>
                <X className="h-4 w-4" strokeWidth={1.9} />
                Fermer l&apos;import
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Importer des documents
              </>
            )}
          </Button>
        ) : null}
      </div>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {pending > 0 || reading ? (
        <Notice
          tone={reading ? "info" : "warn"}
          title={
            reading
              ? "Lecture des documents en cours…"
              : `${pending} document${pending > 1 ? "s" : ""} en attente de lecture`
          }
        >
          <p>
            Un document doit être lu pour pouvoir servir de source citable. La
            lecture se fait pièce par pièce.
          </p>
          {!reading ? (
            <Button className="mt-3" size="sm" onClick={readPending}>
              Lire les documents en attente
            </Button>
          ) : (
            <p className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-brand">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
              {pending} restant{pending > 1 ? "s" : ""}
            </p>
          )}
        </Notice>
      ) : null}

      {showUploader ? (
        <DocumentUploader
          organizationId={organizationId}
          onUploaded={() => {
            router.refresh();
            // Les documents importes sont lus aussitot : ils deviennent des
            // sources utilisables sans action supplementaire.
            void readPending();
          }}
          title="Importez vos documents d'entreprise"
          description="Anciens mémoires techniques, fiches de référence, CV, certifications, procédures QSE. Formats acceptés : PDF, DOCX et XLSX."
          target={{
            bucket: "entreprise",
            table: "company_documents",
            kindOf: guessCompanyKindFromName,
          }}
        />
      ) : null}

      {documents.length === 0 && !showUploader ? (
        <EmptyState
          icon={<Library className="h-5 w-5" strokeWidth={1.8} />}
          title="Aucun document importé"
          description="Importez vos anciens mémoires techniques et vos documents d'entreprise. MateriaBTP pourra s'y appuyer comme sources traçables lors de la rédaction."
          action={
            <Button onClick={() => setShowUploader(true)}>
              Importer des documents
            </Button>
          }
        />
      ) : null}

      {visible.length > 0 ? (
        <ul className="divide-y divide-line-soft overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
          {visible.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:flex-nowrap"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] bg-brand-wash text-brand">
                  <FileText className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold" title={doc.file_name}>
                    {doc.file_name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-42">
                    {[
                      doc.size_bytes ? formatBytes(doc.size_bytes) : null,
                      doc.page_count
                        ? `${doc.page_count} page${doc.page_count > 1 ? "s" : ""}`
                        : null,
                      formatDateTime(doc.created_at),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {doc.status === "FAILED" && doc.failure_reason ? (
                    <p className="mt-1 text-[12px] font-medium text-risk">
                      {doc.failure_reason}
                    </p>
                  ) : null}
                </div>
              </div>

              <select
                value={doc.kind}
                onChange={(e) => changeKind(doc, e.target.value as Kind)}
                aria-label={`Catégorie de ${doc.file_name}`}
                className="h-8 rounded-[8px] border border-line bg-white px-2 text-[12.5px] font-medium focus:border-brand focus:outline-none"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>

              <StatusBadge status={doc.status} />

              <div className="ml-auto flex flex-none items-center gap-1">
                <button
                  type="button"
                  onClick={() => download(doc)}
                  aria-label={`Ouvrir ${doc.file_name}`}
                  title="Ouvrir"
                  className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
                >
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <ConfirmButton
                  label={`Supprimer ${doc.file_name}`}
                  onConfirm={() => remove(doc)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: CompanyDocument["status"] }) {
  if (status === "EXTRACTED") return <Badge tone="ok">Source disponible</Badge>;
  if (status === "EXTRACTING") return <Badge tone="brand">Lecture…</Badge>;
  if (status === "FAILED") return <Badge tone="risk">Illisible</Badge>;
  return <Badge tone="neutral">À lire</Badge>;
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
        active
          ? "border-brand bg-brand-wash text-brand"
          : "border-line bg-white text-ink-58 hover:border-ink-42",
      )}
    >
      {label}
    </button>
  );
}
