"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

const ACTIVITIES = [
  "Entreprise generale",
  "Gros oeuvre",
  "Second oeuvre",
  "Enveloppe et couverture",
  "Genie civil",
  "Travaux publics",
  "Lots techniques (CVC, electricite, plomberie)",
  "Amenagement et finitions",
  "Autre",
];

const STEPS = 3;

export function OnboardingForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [activity, setActivity] = useState("");
  const [presentation, setPresentation] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function finish() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data: orgId, error: rpcError } = await supabase.rpc(
      "create_organization",
      { org_name: name.trim(), org_activity_type: activity || null },
    );

    if (rpcError || !orgId) {
      setError(
        "La creation de votre espace a echoue. Merci de reessayer dans un instant.",
      );
      setPending(false);
      return;
    }

    // La presentation et la zone d'intervention alimentent ensuite la base
    // entreprise : elles sont enregistrees separement, apres rattachement.
    if (presentation.trim() || area.trim()) {
      await supabase
        .from("organizations")
        .update({
          presentation: presentation.trim() || null,
          intervention_area: area.trim() || null,
        })
        .eq("id", orgId as string);
    }

    router.replace("/app");
    router.refresh();
  }

  const canContinue =
    (step === 1 && name.trim().length > 1) || (step === 2 && activity) || step === 3;

  return (
    <div className="mt-10">
      <p className="text-[12.5px] font-bold text-ink-42">
        Etape {step} sur {STEPS}
      </p>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < step ? "bg-brand" : "bg-line"
            }`}
          />
        ))}
      </div>

      {error ? (
        <div className="mt-6">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8">
          <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
            Quel est le nom de votre entreprise ?
          </h1>
          <p className="mt-2 text-[14px] text-ink-58">
            Il apparaitra sur vos dossiers et sur vos memoires techniques
            exportes.
          </p>
          <div className="mt-6">
            <Label htmlFor="org">Raison sociale</Label>
            <Input
              id="org"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Batiment Durand et Fils"
              autoFocus
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8">
          <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
            Quelle est votre activite principale ?
          </h1>
          <p className="mt-2 text-[14px] text-ink-58">
            Cette information oriente la lecture des DCE et la structure de vos
            memoires.
          </p>
          <div className="mt-6 grid gap-2">
            {ACTIVITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setActivity(a)}
                aria-pressed={activity === a}
                className={`rounded-[8px] border px-4 py-3 text-left text-[14px] font-semibold transition-colors ${
                  activity === a
                    ? "border-brand bg-brand-wash text-brand"
                    : "border-line hover:border-ink"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-8">
          <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
            Presentez votre entreprise
          </h1>
          <p className="mt-2 text-[14px] text-ink-58">
            Ce texte sera reutilise comme source. Vous pourrez le completer a
            tout moment depuis la base entreprise.
          </p>
          <div className="mt-6">
            <Label htmlFor="presentation">Presentation</Label>
            <Textarea
              id="presentation"
              rows={6}
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
              placeholder="Activite, anciennete, effectif, savoir-faire, types de chantiers realises..."
            />
            <FieldHint>
              Facultatif a cette etape, mais fortement recommande.
            </FieldHint>
          </div>
          <div className="mt-4">
            <Label htmlFor="area">Zones d&apos;intervention</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex. Occitanie, Nouvelle-Aquitaine"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex items-center gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => setStep((s) => s - 1)}
            disabled={pending}
          >
            Retour
          </Button>
        ) : null}

        {step < STEPS ? (
          <Button
            type="button"
            className="h-11 flex-1"
            disabled={!canContinue}
            onClick={() => setStep((s) => s + 1)}
          >
            Continuer
          </Button>
        ) : (
          <Button
            type="button"
            className="h-11 flex-1"
            disabled={pending}
            onClick={finish}
          >
            {pending ? "Creation de votre espace..." : "Terminer"}
          </Button>
        )}
      </div>
    </div>
  );
}
