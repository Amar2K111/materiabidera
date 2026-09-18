"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { guessDomain } from "@/lib/method-domain";

/**
 * Verse un chapitre valide dans les methodes de la base entreprise.
 *
 * Chaque reponse validee enrichit la base : le prochain memoire part de plus
 * haut. Le dossier d'origine est note en tete, pour que le moteur de redaction
 * sache que ce texte decrit un chantier precis et non une regle generale.
 */
export function SaveToMethods({
  organizationId,
  projectName,
  title,
  content,
}: {
  organizationId: string;
  projectName: string;
  title: string;
  content: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "exists" | "error">("idle");

  async function save() {
    setState("busy");
    const supabase = createClient();
    const methodTitle = `${title} (${projectName})`.slice(0, 200);

    const { data: existing } = await supabase
      .from("company_methods")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("title", methodTitle)
      .limit(1);
    if (existing && existing.length > 0) {
      setState("exists");
      return;
    }

    const { error } = await supabase.from("company_methods").insert({
      organization_id: organizationId,
      title: methodTitle,
      domain: guessDomain(title),
      content: `Rédigé et validé pour le dossier « ${projectName} ». À adapter à chaque nouvelle consultation.\n\n${content.trim()}`,
    });
    setState(error ? "error" : "done");
  }

  if (state === "done" || state === "exists") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ok">
        <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
        {state === "done" ? "Ajouté à vos méthodes" : "Déjà dans vos méthodes"}
        <Link
          href="/app/base-entreprise/methodes"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Voir
        </Link>
      </span>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={save}
        disabled={state === "busy" || content.trim().length === 0}
        title="Réutiliser ce chapitre validé comme méthode dans vos prochains mémoires"
      >
        <BookmarkPlus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        {state === "busy" ? "Ajout…" : "Ajouter à mes méthodes"}
      </Button>
      {state === "error" ? (
        <span className="text-[12.5px] font-semibold text-risk">
          L&apos;ajout a échoué. Réessayez.
        </span>
      ) : null}
    </>
  );
}
