"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_RULES,
  ruleLabel,
  rulePresets,
  type QualificationRule,
} from "@/lib/qualification";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

/**
 * Criteres de qualification (section Go/No-Go).
 *
 * Les regles internes que l'entreprise applique avant de repondre : fixees une
 * fois ici, elles sont verifiees a chaque evaluation d'opportunite. Un critere
 * eliminatoire non respecte conduit a une recommandation NO-GO.
 */
export function QualificationRulesEditor({
  organizationId,
  interventionArea,
  initialRules,
  canEdit,
}: {
  organizationId: string;
  interventionArea: string | null;
  initialRules: QualificationRule[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [rules, setRules] = useState<QualificationRule[]>(initialRules);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "denied">("idle");
  const [dirty, setDirty] = useState(false);

  const update = (next: QualificationRule[]) => {
    setRules(next);
    setDirty(true);
    setStatus("idle");
  };

  const patch = (id: string, change: Partial<QualificationRule>) =>
    update(rules.map((r) => (r.id === id ? { ...r, ...change } : r)));

  // Suggestions encore absentes de la grille.
  const suggestions = rulePresets(interventionArea).filter((preset) =>
    preset.kind === "min_prep_days"
      ? !rules.some((r) => r.kind === "min_prep_days")
      : !rules.some((r) => r.kind === "text" && r.text === preset.text),
  );

  const full = rules.length >= MAX_RULES;

  async function save() {
    setStatus("saving");
    // Une ligne laissee vide n'est pas un critere.
    const cleaned = rules
      .map((r) => ({ ...r, text: r.text.trim() }))
      .filter((r) => (r.kind === "text" ? r.text.length > 0 : Boolean(r.days)));

    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .update({ qualification_rules: cleaned })
      .eq("id", organizationId)
      .select("id");

    if (error) {
      setStatus("error");
      return;
    }
    // Sans droit d'administration, la mise a jour ne touche aucune ligne.
    if (!data || data.length === 0) {
      setStatus("denied");
      return;
    }
    setRules(cleaned);
    setDirty(false);
    setStatus("saved");
    router.refresh();
  }

  return (
    <Card id="criteres">
      <CardHeader>
        <CardTitle>Critères de qualification Go / No-Go</CardTitle>
        <span className="text-[12px] text-ink-58">
          {rules.length} / {MAX_RULES}
        </span>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="max-w-[72ch] text-[13px] leading-relaxed text-ink-58">
          Vos règles internes pour décider de répondre : elles sont vérifiées à
          chaque évaluation, pièces du DCE à l&apos;appui. Un critère{" "}
          <b className="font-semibold text-ink">éliminatoire</b> non respecté
          conduit à une recommandation NO-GO ; un critère simple non respecté
          place la décision « sous réserve ».
        </p>

        {status === "error" ? (
          <Notice tone="risk">
            L&apos;enregistrement a échoué. Réessayez dans un instant.
          </Notice>
        ) : null}
        {status === "denied" || !canEdit ? (
          <Notice tone="warn">
            Seuls les administrateurs de l&apos;entreprise peuvent modifier ces
            critères.
          </Notice>
        ) : null}

        {rules.length === 0 ? (
          <p className="rounded-[8px] border border-dashed border-line px-4 py-5 text-center text-[13px] text-ink-58">
            Aucun critère pour le moment. Les évaluations reposent alors
            uniquement sur l&apos;adéquation entre le dossier et votre base
            entreprise.
          </p>
        ) : (
          <ul className="space-y-2">
            {rules.map((rule, index) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-center gap-3 rounded-[8px] border border-line bg-white px-3 py-2.5"
              >
                <span className="w-6 flex-none text-[12px] font-semibold text-ink-58 tabular">
                  {index + 1}.
                </span>

                {rule.kind === "min_prep_days" ? (
                  <label className="flex min-w-[260px] flex-1 items-center gap-2 text-[13.5px]">
                    Au moins
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={rule.days ?? ""}
                      disabled={!canEdit}
                      onChange={(e) =>
                        patch(rule.id, {
                          days: Math.max(1, Math.min(365, Number(e.target.value) || 1)),
                        })
                      }
                      className="h-8 w-20 text-center"
                      aria-label="Nombre de jours minimum pour préparer l'offre"
                    />
                    jours pour préparer l&apos;offre
                    <span className="text-[12px] text-ink-58">· calculé depuis la date limite</span>
                  </label>
                ) : (
                  <Input
                    value={rule.text}
                    disabled={!canEdit}
                    maxLength={300}
                    placeholder="Exemple : chantier situé à moins de 80 km de nos agences"
                    onChange={(e) => patch(rule.id, { text: e.target.value })}
                    className="h-9 min-w-[260px] flex-1"
                    aria-label={`Critère ${index + 1}`}
                  />
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={rule.blocking}
                  disabled={!canEdit}
                  onClick={() => patch(rule.id, { blocking: !rule.blocking })}
                  className={cn(
                    "h-8 flex-none rounded-full border px-3 text-[12.5px] font-semibold transition-colors",
                    rule.blocking
                      ? "border-risk/30 bg-risk-wash text-risk"
                      : "border-line bg-white text-ink-58 hover:border-ink-42",
                  )}
                  title="Un critère éliminatoire non respecté conduit à un NO-GO"
                >
                  {rule.blocking ? "Éliminatoire" : "Simple"}
                </button>

                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => update(rules.filter((r) => r.id !== rule.id))}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] text-ink-58 transition-colors hover:bg-risk-wash hover:text-risk"
                    aria-label={`Retirer le critère ${index + 1} : ${ruleLabel(rule) || "vide"}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {canEdit ? (
          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={full}
              onClick={() =>
                update([
                  ...rules,
                  { id: newId(), kind: "text", text: "", blocking: false },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Ajouter un critère
            </Button>

            {suggestions.length > 0 && !full ? (
              <div>
                <p className="mb-2 text-[12px] font-medium text-ink-58">
                  Critères courants, à adapter à votre entreprise :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((preset) => (
                    <button
                      key={preset.kind === "min_prep_days" ? "days" : preset.text}
                      type="button"
                      onClick={() => update([...rules, { ...preset, id: newId() }])}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-line bg-white px-3 text-[12.5px] text-ink-70 transition-colors hover:border-brand hover:text-brand"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
                      {preset.kind === "min_prep_days"
                        ? `Au moins ${preset.days} jours pour préparer l'offre`
                        : preset.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {canEdit ? (
          <div className="flex items-center gap-3 border-t border-line-soft pt-4">
            <Button
              type="button"
              onClick={save}
              disabled={!dirty || status === "saving"}
            >
              {status === "saving" ? "Enregistrement…" : "Enregistrer les critères"}
            </Button>
            {status === "saved" ? (
              <span className="text-[13px] font-semibold text-ok">
                Critères enregistrés. Ils s&apos;appliqueront à la prochaine
                évaluation Go / No-Go.
              </span>
            ) : dirty ? (
              <span className="text-[12.5px] text-ink-58">Modifications non enregistrées</span>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
