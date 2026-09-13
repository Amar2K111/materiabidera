"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectDocument } from "@/lib/data/projects";
import {
  DOCUMENT_KIND_LABELS,
  type DocumentKind,
  formatBytes,
} from "@/lib/documents";
import { formatDateTime } from "@/lib/projects";
import { DceUploader } from "@/components/app/dce-uploader";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { openInTab, reserveTab } from "@/lib/utils/browser-file";

const KIND_OPTIONS = Object.keys(DOCUMENT_KIND_LABELS) as DocumentKind[];

export function DocumentsSection({
  organizationId,
  projectId,
  documents,
  hasAnalysis,
}: {
  organizationId: string;
  projectId: string;
  documents: ProjectDocument[];
  hasAnalysis: boolean;
}) {
  const router = useRouter();
  const [showUploader, setShowUploader] = useState(documents.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = documents.filter(
    (d) => d.status === "UPLOADED" || d.status === "EXTRACTING",
  ).length;
  const pages = documents.reduce((sum, d) => sum + (d.page_count ?? 0), 0);

  async function changeKind(doc: ProjectDocument, kind: DocumentKind) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("project_documents")
      .update({ kind })
      .eq("id", doc.id);

    if (updateError) {
      setError("La nature du document n'a pas pu être modifiée.");
      return;
    }
    router.refresh();
  }

  async function remove(doc: ProjectDocument) {
    setError(null);
    setBusyId(doc.id);
    const supabase = createClient();

    // Le fichier part d'abord ; la ligne ne disparait que si le fichier a
    // bien ete supprime, pour ne jamais laisser de piece orpheline.
    const { error: storageError } = await supabase.storage
      .from("dce")
      .remove([doc.storage_path]);

    if (storageError) {
      setError("Le document n'a pas pu être supprimé. Merci de réessayer.");
      setBusyId(null);
      return;
    }

    await supabase.from("project_documents").delete().eq("id", doc.id);
    setBusyId(null);
    router.refresh();
  }

  async function download(doc: ProjectDocument) {
    setError(null);
    // L'onglet est ouvert pendant le clic, sinon le navigateur le bloque.
    const tab = reserveTab();
    const supabase = createClient();
    // Lien signe de courte duree : le bucket reste prive.
    const { data, error: signError } = await supabase.storage
      .from("dce")
      .createSignedUrl(doc.storage_path, 60);

    if (signError || !data) {
      tab?.close();
      setError("Le document n'a pas pu être ouvert.");
      return;
    }
    openInTab(tab, data.signedUrl);
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
            Pièces du DCE
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-58">
            {documents.length === 0
              ? "Aucune pièce déposée pour le moment."
              : `${documents.length} pièce${documents.length > 1 ? "s" : ""}${
                  pages > 0 ? ` · ${pages} page${pages > 1 ? "s" : ""} lues` : ""
                }`}
          </p>
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
                Fermer le dépôt
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Ajouter des pièces
              </>
            )}
          </Button>
        ) : null}
      </div>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {pending > 0 ? (
        <Notice
          tone="warn"
          title={`${pending} pièce${pending > 1 ? "s" : ""} en attente de lecture`}
        >
          <p>
            {hasAnalysis
              ? "Relancez l'analyse pour que ces pièces soient lues et prises en compte dans les exigences."
              : "Lancez l'analyse : les pièces seront lues une à une, puis le dossier sera analysé."}
          </p>
          <ButtonLink
            href={`/app/dossiers/${projectId}/analyse`}
            size="sm"
            className="mt-3"
          >
            {hasAnalysis ? "Relancer l'analyse" : "Lancer l'analyse"}
          </ButtonLink>
        </Notice>
      ) : null}

      {showUploader ? (
        <DceUploader
          organizationId={organizationId}
          projectId={projectId}
          onUploaded={() => router.refresh()}
        />
      ) : null}

      {documents.length === 0 && !showUploader ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
          title="Aucune pièce déposée"
          description="Déposez le règlement de consultation, le CCTP, le CCAP et les autres pièces du dossier de consultation pour permettre leur analyse."
          action={
            <Button onClick={() => setShowUploader(true)}>
              Déposer des pièces
            </Button>
          }
        />
      ) : null}

      {documents.length > 0 ? (
        <ul className="divide-y divide-line-soft overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
          {documents.map((doc) => (
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
                onChange={(e) => changeKind(doc, e.target.value as DocumentKind)}
                className="h-8 rounded-[8px] border border-line bg-white px-2 text-[12.5px] font-medium focus:border-brand focus:outline-none"
                aria-label={`Nature de ${doc.file_name}`}
              >
                {KIND_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {DOCUMENT_KIND_LABELS[k]}
                  </option>
                ))}
              </select>

              <DocumentStatusBadge doc={doc} />

              <div className="ml-auto flex items-center gap-1">
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
                  disabled={busyId === doc.id}
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

function DocumentStatusBadge({ doc }: { doc: ProjectDocument }) {
  if (doc.status === "EXTRACTED") return <Badge tone="ok">Texte extrait</Badge>;
  if (doc.status === "EXTRACTING") return <Badge tone="brand">Lecture…</Badge>;
  if (doc.status === "FAILED") return <Badge tone="risk">Échec de lecture</Badge>;
  return <Badge tone="neutral">En attente</Badge>;
}
