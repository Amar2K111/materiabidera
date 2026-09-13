"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmButton } from "@/components/ui/confirm-button";

/**
 * Suppression d'un dossier et de ses fichiers.
 *
 * Les fichiers du DCE et les exports sont retires du stockage avant la ligne
 * du dossier : la suppression en cascade ne les atteint pas, et ils ne doivent
 * pas rester orphelins dans un bucket prive.
 */
export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    setError(null);
    const supabase = createClient();

    const [{ data: documents }, { data: exports }] = await Promise.all([
      supabase.from("project_documents").select("storage_path").eq("project_id", projectId),
      supabase.from("exports").select("storage_path").eq("project_id", projectId),
    ]);

    const dcePaths = (documents ?? []).map((d) => d.storage_path as string).filter(Boolean);
    const exportPaths = (exports ?? []).map((e) => e.storage_path as string).filter(Boolean);

    if (dcePaths.length > 0) await supabase.storage.from("dce").remove(dcePaths);
    if (exportPaths.length > 0) await supabase.storage.from("exports").remove(exportPaths);

    const { error: deleteError, count } = await supabase
      .from("projects")
      .delete({ count: "exact" })
      .eq("id", projectId);

    if (deleteError || count === 0) {
      setBusy(false);
      setError(
        "Le dossier n'a pas pu être supprimé. Seuls les administrateurs de l'entreprise peuvent le faire.",
      );
      return;
    }

    router.push("/app/dossiers");
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <ConfirmButton
        label="Supprimer le dossier"
        confirmLabel="Supprimer le dossier"
        onConfirm={remove}
        disabled={busy}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
      </ConfirmButton>
      {error ? (
        <span role="alert" className="max-w-[260px] text-right text-[12px] text-risk">
          {error}
        </span>
      ) : null}
    </span>
  );
}
