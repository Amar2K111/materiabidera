"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

/**
 * Construit le plan puis enchaine la redaction de tout le memoire.
 *
 * La redaction elle-meme se deroule dans l'editeur, qui affiche chaque
 * chapitre des qu'il est pret : ce bouton ne fait que construire le plan et
 * l'y conduire avec la consigne de tout rediger.
 */
export function PlanAndWriteButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [running, setRunning] = useState<"plan-only" | "plan-and-write" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(mode: "plan-only" | "plan-and-write") {
    setRunning(mode);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "plan" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.message ?? "Le plan n'a pas pu être construit.");
        setRunning(null);
        return;
      }
    } catch {
      setError("Le plan n'a pas pu être construit. Merci de relancer.");
      setRunning(null);
      return;
    }

    if (mode === "plan-and-write") {
      router.push(`${pathname}?rediger=tout`);
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" className="h-11" onClick={() => run("plan-and-write")} disabled={running !== null}>
          {running === "plan-and-write" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <Sparkles className="h-4 w-4" strokeWidth={1.8} />
          )}
          {running === "plan-and-write" ? "Construction du plan…" : "Construire le plan et rédiger tout le mémoire"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => run("plan-only")}
          disabled={running !== null}
        >
          {running === "plan-only" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
              Construction du plan…
            </>
          ) : (
            "Construire le plan seulement"
          )}
        </Button>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-42">
        La rédaction complète prend environ 30 secondes par chapitre. Chaque chapitre
        s&apos;affiche dès qu&apos;il est prêt, et vous pouvez l&apos;arrêter à tout moment.
      </p>
      {error ? (
        <div className="mt-4">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}
    </div>
  );
}
