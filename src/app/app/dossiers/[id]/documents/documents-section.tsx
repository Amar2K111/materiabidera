"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";

const KIND_OPTIONS = Object.keys(DOCUMENT_KIND_LABELS) as DocumentKind[];

export function DocumentsSection({
  organizationId,
  projectId,
  documents,
}: {
  organizationId: string;
  projectId: string;
  documents: ProjectDocument[];
}) {
  const router = useRouter();
  const [showUploader, setShowUploader] = useState(documents.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeKind(doc: ProjectDocument, kind: DocumentKind) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("project_documents")
      .update({ kind })
      .eq("id", doc.id);

    if (updateError) {
      setError("La nature du document n'a pas pu etre modifiee.");
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
      setError("Le document n'a pas pu etre supprime. Merci de reessayer.");
      setBusyId(null);
      return;
    }

    await supabase.from("project_documents").delete().eq("id", doc.id);
    setBusyId(null);
    router.refresh();
  }

  async function download(doc: ProjectDocument) {
    setError(null);
    const supabase = createClient();
    // Lien signe de courte duree : le bucket reste prive.
    const { data, error: signError } = await supabase.storage
      .from("dce")
      .createSignedUrl(doc.storage_path, 60);

    if (signError || !data) {
      setError("Le document n'a pas pu etre ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold">Pieces du DCE</h2>
          <p className="mt-1.5 text-[13.5px] text-ink-58">
            {documents.length === 0
              ? "Aucune piece deposee pour le moment."
              : `${documents.length} piece${documents.length > 1 ? "s" : ""} deposee${
                  documents.length > 1 ? "s" : ""
                }.`}
          </p>
        </div>
        {documents.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowUploader((v) => !v)}
          >
            {showUploader ? "Masquer le depot" : "Ajouter des pieces"}
          </Button>
        ) : null}
      </div>

      {error ? <Notice tone="risk">{error}</Notice> : null}

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
          title="Aucune piece deposee"
          description="Deposez le reglement de consultation, le CCTP, le CCAP et les autres pieces du dossier de consultation pour permettre leur analyse."
          action={
            <Button onClick={() => setShowUploader(true)}>
              Deposer des pieces
            </Button>
          }
        />
      ) : null}

      {documents.length > 0 ? (
        <div className="overflow-x-auto rounded-[10px] border border-line">
          <table className="min-w-[820px]">
            <thead>
              <tr className="border-b border-line bg-paper text-left">
                <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">
                  Fichier
                </th>
                <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">
                  Nature
                </th>
                <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">
                  Pages
                </th>
                <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">
                  Etat
                </th>
                <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-line-soft last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold">{doc.file_name}</p>
                    <p className="mt-0.5 text-[12px] text-ink-42">
                      {doc.size_bytes ? formatBytes(doc.size_bytes) : ""}
                      {doc.size_bytes ? " | " : ""}
                      {formatDateTime(doc.created_at)}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={doc.kind}
                      onChange={(e) =>
                        changeKind(doc, e.target.value as DocumentKind)
                      }
                      className="h-8 rounded-[6px] border border-line bg-white px-2 text-[12.5px] font-semibold focus:border-brand focus:outline-none"
                      aria-label={`Nature de ${doc.file_name}`}
                    >
                      {KIND_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          {DOCUMENT_KIND_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-[13px] text-ink-70">
                    {doc.page_count ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    <DocumentStatusBadge doc={doc} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
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
                        disabled={busyId === doc.id}
                        aria-label={`Supprimer ${doc.file_name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-risk-wash hover:text-risk disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function DocumentStatusBadge({ doc }: { doc: ProjectDocument }) {
  if (doc.status === "EXTRACTED") return <Badge tone="ok">Texte extrait</Badge>;
  if (doc.status === "EXTRACTING") return <Badge tone="brand">Extraction</Badge>;
  if (doc.status === "FAILED") {
    return (
      <Badge tone="risk" title={doc.failure_reason ?? undefined}>
        Echec de lecture
      </Badge>
    );
  }
  return <Badge tone="neutral">En attente d&apos;analyse</Badge>;
}
