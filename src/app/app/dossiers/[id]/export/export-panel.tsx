"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ExportRecord } from "@/lib/data/quality";
import { formatBytes } from "@/lib/documents";
import { formatDateTime } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

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

  async function run(format: "DOCX" | "PDF") {
    setBusy(format);
    setError(null);

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

      // Le lien signe est de courte duree : on l'ouvre immediatement.
      window.open(payload.result.url, "_blank", "noopener,noreferrer");
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
      .createSignedUrl(record.storage_path, 300);

    if (signError || !data) {
      setError("Ce document n'a pas pu etre ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-8">
      {writtenCount < totalCount ? (
        <Notice tone="warn" title="Le memoire est incomplet">
          {writtenCount} chapitre(s) rediges sur {totalCount}. Les chapitres
          vides apparaitront dans le document avec la mention « Chapitre non
          redige ».
        </Notice>
      ) : null}

      {remaining > 0 ? (
        <Notice tone="warn" title={`${remaining} point(s) de checklist ouverts`}>
          <p className="mt-1">
            Vous pouvez exporter, mais la checklist avant remise n&apos;est pas
            entierement satisfaite.
          </p>
          <Link href={`/app/dossiers/${projectId}/checklist`}>
            <Button variant="ghost" className="mt-4">
              Voir la checklist
            </Button>
          </Link>
        </Notice>
      ) : null}

      {error ? <Notice tone="risk">{error}</Notice> : null}

      <section>
        <h2 className="text-[15px] font-bold">Telecharger le memoire</h2>
        <p className="mt-1.5 max-w-[75ch] text-[13px] leading-relaxed text-ink-58">
          Le document comporte une couverture, un sommaire, des titres
          hierarchises, des en-tetes et une pagination. Le fichier Word conserve
          de vrais styles de titre : le sommaire s&apos;y met a jour et le volet
          de navigation reste utilisable.
        </p>

        <label className="mt-5 flex max-w-[70ch] cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={includeSources}
            onChange={(e) => setIncludeSources(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none accent-[#0035A9]"
          />
          <span className="text-[13px]">
            <span className="font-semibold">
              Inclure les sources en fin de chapitre.
            </span>{" "}
            <span className="text-ink-58">
              Utile pour votre relecture interne. A decocher pour le document
              remis a l&apos;acheteur, sauf si le reglement le demande.
            </span>
          </span>
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="h-11"
            onClick={() => run("DOCX")}
            disabled={busy !== null}
          >
            {busy === "DOCX" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                Preparation...
              </>
            ) : (
              "Telecharger Word"
            )}
          </Button>

          <Button
            variant="ghost"
            className="h-11"
            onClick={() => run("PDF")}
            disabled={busy !== null}
          >
            {busy === "PDF" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                Preparation...
              </>
            ) : (
              "Telecharger PDF"
            )}
          </Button>
        </div>
      </section>

      {exports.length > 0 ? (
        <section className="border-t border-line pt-6">
          <h2 className="mb-4 text-[15px] font-bold">Exports precedents</h2>
          <ul className="space-y-2">
            {exports.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center gap-4 rounded-[10px] border border-line bg-white p-3.5 shadow-card"
              >
                <FileText
                  className="h-4 w-4 flex-none text-ink-42"
                  strokeWidth={1.8}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {record.file_name}
                  </p>
                  <p className="text-[12px] text-ink-42">
                    {formatDateTime(record.created_at)}
                    {record.size_bytes
                      ? ` | ${formatBytes(record.size_bytes)}`
                      : ""}
                    {record.section_count
                      ? ` | ${record.section_count} chapitre(s)`
                      : ""}
                  </p>
                </div>
                <Badge>{record.format}</Badge>
                <button
                  type="button"
                  onClick={() => download(record)}
                  aria-label={`Telecharger ${record.file_name}`}
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
