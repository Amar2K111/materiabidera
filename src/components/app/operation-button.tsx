"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

type Operation = "analyze" | "go-no-go" | "strategy" | "plan";

/**
 * Declenche une operation d'analyse et rend compte de son issue.
 *
 * Le message d'erreur affiche est celui prepare par le serveur : jamais une
 * trace technique (section 26).
 */
export function OperationButton({
  projectId,
  operation,
  label,
  runningLabel,
  variant = "primary",
}: {
  projectId: string;
  operation: Operation;
  label: string;
  runningLabel: string;
  variant?: "primary" | "ghost";
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "L'operation n'a pas pu aboutir.");
        setRunning(false);
        return;
      }
    } catch {
      setError("L'operation n'a pas pu aboutir. Merci de relancer.");
      setRunning(false);
      return;
    }

    setRunning(false);
    router.refresh();
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        onClick={run}
        disabled={running}
        className="h-11"
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            {runningLabel}
          </>
        ) : (
          label
        )}
      </Button>

      {error ? (
        <div className="mt-4">
          <Notice tone="risk">{error}</Notice>
        </div>
      ) : null}
    </div>
  );
}
