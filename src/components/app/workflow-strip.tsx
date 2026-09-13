import { cn } from "@/lib/utils/cn";

const STEPS = [
  "DCE",
  "Analyse",
  "Go / No-Go",
  "Exigences",
  "Base entreprise",
  "Mémoire",
  "Contrôle",
  "Export",
] as const;

export function WorkflowStrip({ className }: { className?: string }) {
  return (
    <div className={cn("app-ui__workflow", className)}>
      <p className="app-ui__workflow-label">Parcours de réponse</p>
      <ol className="app-ui__workflow-steps" aria-label="Étapes de réponse aux appels d'offres">
        {STEPS.map((step, index) => (
          <li key={step} className="app-ui__workflow-step">
            <span className="app-ui__workflow-index">{String(index + 1).padStart(2, "0")}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
