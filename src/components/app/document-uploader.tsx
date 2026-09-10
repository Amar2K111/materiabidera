"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Trash2, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILES_PER_UPLOAD,
  formatBytes,
  safeFileName,
  validateFile,
} from "@/lib/documents";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

type ItemState = "pending" | "uploading" | "done" | "rejected";

type Item = {
  key: string;
  file: File;
  state: ItemState;
  message?: string;
};

export type UploadTarget = {
  /** Bucket de stockage prive. */
  bucket: string;
  /** Table recevant la ligne de suivi. */
  table: string;
  /** Segments de chemin inseres apres l'identifiant d'organisation. */
  pathSegments?: string[];
  /** Colonnes supplementaires a renseigner sur la ligne. */
  extraColumns?: Record<string, unknown>;
  /** Nature proposee pour un fichier donne. */
  kindOf?: (fileName: string) => string;
};

/**
 * Depot de fichiers.
 *
 * L'avancement affiche correspond aux fichiers reellement transferes : aucun
 * pourcentage n'est simule (section 8). Chaque fichier porte son propre etat,
 * et un echec sur l'un n'interrompt pas les autres.
 */
export function DocumentUploader({
  organizationId,
  target,
  title = "Deposez vos fichiers",
  description = "Glissez vos fichiers ici, ou parcourez votre ordinateur. Formats acceptes : PDF, DOC, DOCX, XLS, XLSX et ZIP.",
  onUploaded,
}: {
  organizationId: string;
  target: UploadTarget;
  title?: string;
  description?: string;
  onUploaded?: (count: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGlobalError(null);

    setItems((current) => {
      const room = MAX_FILES_PER_UPLOAD - current.length;
      if (room <= 0) {
        setGlobalError(
          `Vous pouvez deposer au maximum ${MAX_FILES_PER_UPLOAD} fichiers a la fois.`,
        );
        return current;
      }

      const incoming = Array.from(files)
        .slice(0, room)
        .map<Item>((file) => {
          const reason = validateFile(file);
          return {
            key: `${file.name}-${file.size}-${file.lastModified}`,
            file,
            state: reason ? "rejected" : "pending",
            message: reason ?? undefined,
          };
        });

      // Un meme fichier depose deux fois n'est ajoute qu'une seule fois.
      const known = new Set(current.map((i) => i.key));
      return [...current, ...incoming.filter((i) => !known.has(i.key))];
    });
  }, []);

  function removeItem(key: string) {
    setItems((current) => current.filter((i) => i.key !== key));
  }

  async function upload() {
    const queue = items.filter((i) => i.state === "pending");
    if (queue.length === 0) return;

    setBusy(true);
    setGlobalError(null);
    const supabase = createClient();
    const prefix = [organizationId, ...(target.pathSegments ?? [])].join("/");
    let uploaded = 0;

    for (const item of queue) {
      setItems((c) =>
        c.map((i) => (i.key === item.key ? { ...i, state: "uploading" } : i)),
      );

      const path = `${prefix}/${crypto.randomUUID()}-${safeFileName(item.file.name)}`;

      const { error: storageError } = await supabase.storage
        .from(target.bucket)
        .upload(path, item.file, {
          contentType: item.file.type || "application/octet-stream",
          upsert: false,
        });

      if (storageError) {
        setItems((c) =>
          c.map((i) =>
            i.key === item.key
              ? {
                  ...i,
                  state: "rejected",
                  message:
                    "Le transfert a echoue. Verifiez votre connexion puis reessayez.",
                }
              : i,
          ),
        );
        continue;
      }

      const { error: dbError } = await supabase.from(target.table).insert({
        organization_id: organizationId,
        storage_path: path,
        file_name: item.file.name,
        mime_type: item.file.type || null,
        size_bytes: item.file.size,
        status: "UPLOADED",
        ...(target.kindOf ? { kind: target.kindOf(item.file.name) } : {}),
        ...(target.extraColumns ?? {}),
      });

      if (dbError) {
        // Le fichier transfere sans enregistrement serait orphelin.
        await supabase.storage.from(target.bucket).remove([path]);
        setItems((c) =>
          c.map((i) =>
            i.key === item.key
              ? {
                  ...i,
                  state: "rejected",
                  message: "Le document n'a pas pu etre enregistre.",
                }
              : i,
          ),
        );
        continue;
      }

      uploaded += 1;
      setItems((c) =>
        c.map((i) => (i.key === item.key ? { ...i, state: "done" } : i)),
      );
    }

    setBusy(false);
    if (uploaded > 0) onUploaded?.(uploaded);
    else {
      setGlobalError("Aucun fichier n'a pu etre depose. Merci de reessayer.");
    }
  }

  const pendingCount = items.filter((i) => i.state === "pending").length;
  const doneCount = items.filter((i) => i.state === "done").length;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center rounded-[12px] border border-dashed px-6 py-12 text-center transition-colors",
          dragging ? "border-brand bg-brand-wash" : "border-line bg-paper",
        )}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[9px] bg-white text-brand shadow-card">
          <FileUp className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <p className="text-[15px] font-bold">{title}</p>
        <p className="mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-ink-58">
          {description}
        </p>
        <Button
          type="button"
          variant="ghost"
          className="mt-5"
          onClick={() => inputRef.current?.click()}
        >
          Parcourir mes fichiers
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {globalError ? (
        <div className="mt-4">
          <Notice tone="risk">{globalError}</Notice>
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <ul className="mt-6 overflow-hidden rounded-[10px] border border-line">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-3 border-b border-line-soft px-4 py-3 last:border-b-0"
              >
                <StateIcon state={item.state} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {item.file.name}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[12px]",
                      item.state === "rejected" ? "text-risk" : "text-ink-42",
                    )}
                  >
                    {item.message ?? formatBytes(item.file.size)}
                  </p>
                </div>

                {item.state === "pending" || item.state === "rejected" ? (
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
                    aria-label={`Retirer ${item.file.name}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={upload}
              disabled={busy || pendingCount === 0}
              className="h-11"
            >
              {busy
                ? "Transfert en cours..."
                : `Deposer ${pendingCount} fichier${pendingCount > 1 ? "s" : ""}`}
            </Button>
            {doneCount > 0 ? (
              <span className="text-[13px] font-semibold text-ok">
                {doneCount} fichier{doneCount > 1 ? "s" : ""} depose
                {doneCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function StateIcon({ state }: { state: ItemState }) {
  if (state === "uploading") {
    return (
      <Loader2
        className="h-4 w-4 flex-none animate-spin text-brand"
        strokeWidth={1.8}
      />
    );
  }
  if (state === "done") {
    return <CheckCircle2 className="h-4 w-4 flex-none text-ok" strokeWidth={1.8} />;
  }
  if (state === "rejected") {
    return (
      <TriangleAlert className="h-4 w-4 flex-none text-risk" strokeWidth={1.8} />
    );
  }
  return <span className="h-2 w-2 flex-none rounded-full bg-ink-42" />;
}
