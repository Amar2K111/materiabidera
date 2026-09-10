"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

type Step = {
  key: string;
  label: string;
  state: "running" | "done" | "failed";
  detail?: string;
};

type IngestResponse = {
  processed: {
    fileName: string;
    status: "EXTRACTED" | "FAILED" | "EXPANDED";
    message?: string;
    pageCount?: number | null;
    addedDocuments?: number;
  } | null;
  remaining: number;
  done: boolean;
  message?: string;
};

/**
 * Lance la lecture des pieces puis l'analyse du dossier.
 *
 * Chaque ligne affichee correspond a une operation qui a reellement eu lieu :
 * aucune etape n'est jouee a l'avance ni simulee (sections 8 et 37).
 */
export function AnalysisRunner({
  projectId,
  label = "Lancer l'analyse",
}: {
  projectId: string;
  label?: string;
}) {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function push(step: Step) {
    setSteps((s) => [...s, step]);
  }

  function settle(key: string, state: "done" | "failed", detail?: string) {
    setSteps((s) =>
      s.map((step) => (step.key === key ? { ...step, state, detail } : step)),
    );
  }

  async function run() {
    setRunning(true);
    setError(null);
    setSteps([]);

    // --- Lecture des pieces, une par une -------------------------------------
    let guard = 0;
    for (;;) {
      guard += 1;
      // Garde-fou : une archive peut ajouter des pieces, mais le nombre de
      // passages reste borne pour ne jamais boucler indefiniment.
      if (guard > 200) break;

      const key = `ingest-${guard}`;
      push({ key, label: "Lecture d'un document...", state: "running" });

      let payload: IngestResponse;
      try {
        const response = await fetch(`/api/projects/${projectId}/ingest`, {
          method: "POST",
        });
        payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
      } catch {
        settle(key, "failed");
        setError(
          "La lecture des documents a ete interrompue. Merci de relancer.",
        );
        setRunning(false);
        return;
      }

      const done = payload.processed;

      if (!done) {
        // Rien a traiter : on retire la ligne d'attente inutile.
        setSteps((s) => s.filter((step) => step.key !== key));
        break;
      }

      if (done.status === "FAILED") {
        settle(key, "failed", `${done.fileName} : ${done.message ?? ""}`);
      } else if (done.status === "EXPANDED") {
        settle(
          key,
          "done",
          `${done.fileName} : archive ouverte, ${done.addedDocuments ?? 0} piece(s) ajoutee(s)`,
        );
      } else {
        settle(
          key,
          "done",
          done.pageCount
            ? `${done.fileName} : ${done.pageCount} page(s) lues`
            : `${done.fileName} : texte extrait`,
        );
      }

      if (payload.remaining === 0) break;
    }

    // --- Analyse du dossier ---------------------------------------------------
    const analyseKey = "analyse";
    push({
      key: analyseKey,
      label: "Analyse du dossier de consultation...",
      state: "running",
    });

    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "analyze" }),
      });
      const payload = await response.json();

      if (!response.ok) {
        settle(analyseKey, "failed");
        setError(payload.message ?? "L'analyse n'a pas pu aboutir.");
        setRunning(false);
        return;
      }

      settle(
        analyseKey,
        "done",
        `${payload.outcome.requirements} exigence(s), ${payload.outcome.vigilancePoints} point(s) de vigilance`,
      );
    } catch {
      settle(analyseKey, "failed");
      setError("L'analyse n'a pas pu aboutir. Merci de relancer.");
      setRunning(false);
      return;
    }

    setRunning(false);
    router.refresh();
  }

  return (
    <div>
      <Button type="button" onClick={run} disabled={running} className="h-11">
        {running ? "Analyse en cours..." : label}
      </Button>

      {error ? (
        <div className="mt-5">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}

      {steps.length > 0 ? (
        <ul className="mt-6 space-y-2.5">
          {steps.map((step) => (
            <li key={step.key} className="flex items-start gap-2.5">
              {step.state === "running" ? (
                <Loader2
                  className="mt-0.5 h-4 w-4 flex-none animate-spin text-brand"
                  strokeWidth={1.8}
                />
              ) : step.state === "done" ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 flex-none text-ok"
                  strokeWidth={1.8}
                />
              ) : (
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 flex-none text-risk"
                  strokeWidth={1.8}
                />
              )}
              <span className="text-[13px]">
                <span className="font-semibold">
                  {step.detail ?? step.label}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
