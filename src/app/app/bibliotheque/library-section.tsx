"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Library, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CompanyDocument } from "@/lib/data/company";
import { formatBytes } from "@/lib/documents";
import { formatDateTime } from "@/lib/projects";
import { DocumentUploader } from "@/components/app/document-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

type Kind = CompanyDocument["kind"];

const KIND_LABELS: Record<Kind, string> = {
  REFERENCE: "References",
  MEMOIRE: "Memoires",
  METHODE: "Methodes",
  CV: "CV",
  CERTIFICATION: "Certifications",
  QSE: "QSE",
  MATERIEL: "Materiel",
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
        if (!payload.processed || payload.remaining === 0) break;
      } catch {
        setError("La lecture des documents a ete interrompue.");
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
      setError("La categorie n'a pas pu etre modifiee.");
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
      setError("Le document n'a pas pu etre supprime.");
      return;
    }

    await supabase.from("company_documents").delete().eq("id", doc.id);
    router.refresh();
  }

  async function download(doc: CompanyDocument) {
    setError(null);
    const supabase = createClient();
    const { data, error: signError } = await supabase.storage
      .from("entreprise")
      .createSignedUrl(doc.storage_path, 60);

    if (signError || !data) {
      setError("Le document n'a pas pu etre ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
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
            variant="ghost"
            onClick={() => setShowUploader((v) => !v)}
          >
            {showUploader ? "Masquer le depot" : "Importer des documents"}
          </Button>
        ) : null}
      </div>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {pending > 0 ? (
        <Notice title={`${pending} document(s) en attente de lecture`}>
          <p className="mt-1">
            Un document doit etre lu pour pouvoir servir de source citable. La
            lecture se fait piece par piece.
          </p>
          <Button className="mt-4" onClick={readPending} disabled={reading}>
            {reading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                Lecture en cours...
              </>
            ) : (
              "Lire les documents en attente"
            )}
          </Button>
        </Notice>
      ) : null}

      {showUploader ? (
        <DocumentUploader
          organizationId={organizationId}
          onUploaded={() => router.refresh()}
          title="Importez vos documents d'entreprise"
          description="Anciens memoires techniques, fiches de reference, CV, certifications, procedures QSE. Formats acceptes : PDF, DOCX et XLSX."
          target={{ bucket: "entreprise", table: "company_documents" }}
        />
      ) : null}

      {documents.length === 0 && !showUploader ? (
        <EmptyState
          icon={<Library className="h-5 w-5" strokeWidth={1.8} />}
          title="Aucun document importe"
          description="Importez vos anciens memoires techniques et vos documents d'entreprise. BIDERA pourra s'y appuyer comme sources tracables lors de la redaction."
          action={
            <Button onClick={() => setShowUploader(true)}>
              Importer des documents
            </Button>
          }
        />
      ) : null}

      {visible.length > 0 ? (
        <ul className="space-y-2.5">
          {visible.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center gap-4 rounded-[10px] border border-line bg-white p-4 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold">
                  {doc.file_name}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-42">
                  {doc.size_bytes ? `${formatBytes(doc.size_bytes)} | ` : ""}
                  {doc.page_count ? `${doc.page_count} page(s) | ` : ""}
                  {formatDateTime(doc.created_at)}
                </p>
                {doc.status === "FAILED" && doc.failure_reason ? (
                  <p className="mt-1 text-[12px] text-risk">
                    {doc.failure_reason}
                  </p>
                ) : null}
              </div>

              <select
                value={doc.kind}
                onChange={(e) => changeKind(doc, e.target.value as Kind)}
                aria-label={`Categorie de ${doc.file_name}`}
                className="h-8 rounded-[6px] border border-line bg-white px-2 text-[12.5px] font-semibold focus:border-brand focus:outline-none"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>

              <StatusBadge status={doc.status} />

              <div className="flex flex-none gap-1">
                <button
                  type="button"
                  onClick={() => download(doc)}
                  aria-label={`Ouvrir ${doc.file_name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
                >
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(doc)}
                  aria-label={`Supprimer ${doc.file_name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-risk-wash hover:text-risk"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
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
  if (status === "EXTRACTING") return <Badge tone="brand">Lecture</Badge>;
  if (status === "FAILED") return <Badge tone="risk">Illisible</Badge>;
  return <Badge tone="neutral">A lire</Badge>;
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
        "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
        active
          ? "border-brand bg-brand-wash text-brand"
          : "border-line text-ink-58 hover:border-ink",
      )}
    >
      {label}
    </button>
  );
}
