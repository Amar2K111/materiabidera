import type { ProjectProgressSummary } from "@/lib/data/projects";
import { NEXT_STEP, type ProjectStatus } from "@/lib/projects";

export type NextStep = {
  title: string;
  detail: string;
  label: string;
  segment: string;
};

/** Ce que l'utilisateur doit faire maintenant, et pourquoi. */
export function nextStepFor(
  status: ProjectStatus,
  progress: ProjectProgressSummary,
): NextStep {
  if (progress.documents === 0) {
    return {
      title: "Déposer les pièces du DCE",
      detail:
        "Règlement de consultation, CCTP, CCAP, DPGF : tout ce qui permet d'identifier les exigences opposables.",
      label: "Déposer les pièces",
      segment: "documents",
    };
  }
  if (!progress.hasAnalysis || progress.pendingDocuments > 0) {
    return {
      title: progress.hasAnalysis
        ? "De nouvelles pièces attendent d'être lues"
        : "Analyser le DCE",
      detail:
        "MateriaBTP lit les pièces, extrait les exigences avec leur source et signale les points de vigilance.",
      label: progress.hasAnalysis ? "Relancer l'analyse" : "Analyser le DCE",
      segment: "analyse",
    };
  }
  if (!progress.decision) {
    return {
      title: "Évaluer l'opportunité",
      detail:
        "Confronter les exigences du dossier à votre base entreprise pour décider s'il faut répondre.",
      label: "Évaluer le Go / No-Go",
      segment: "go-no-go",
    };
  }
  if (!progress.hasStrategy) {
    return {
      title: "Construire la stratégie de réponse",
      detail:
        "Définir où porter l'effort selon les critères de jugement, avant de rédiger.",
      label: "Construire la stratégie",
      segment: "strategie",
    };
  }
  if (progress.sections === 0 || progress.writtenSections < progress.sections) {
    return {
      title:
        progress.sections === 0
          ? "Construire le plan du mémoire"
          : `Rédiger le mémoire (${progress.writtenSections}/${progress.sections} chapitres)`,
      detail:
        "Chaque chapitre s'appuie sur le DCE et sur votre base entreprise, sources à l'appui.",
      label: progress.sections === 0 ? "Construire le plan" : "Continuer la rédaction",
      segment: "memoire",
    };
  }
  if (!progress.hasQuality) {
    return {
      title: "Contrôler le mémoire",
      detail:
        "Vérifier la couverture des exigences, la précision et la traçabilité avant la remise.",
      label: "Lancer le contrôle",
      segment: "controle",
    };
  }
  if (progress.openBlockingIssues > 0) {
    return {
      title: `${progress.openBlockingIssues} problème${progress.openBlockingIssues > 1 ? "s" : ""} bloquant${progress.openBlockingIssues > 1 ? "s" : ""} à traiter`,
      detail:
        "Le contrôle qualité a relevé des points qui feraient perdre des points à la commission.",
      label: "Voir les problèmes",
      segment: "controle",
    };
  }
  const fallback = NEXT_STEP[status];
  return {
    title: progress.exports > 0 ? "Réponse exportée" : "Valider la checklist et exporter",
    detail:
      progress.exports > 0
        ? "Relisez le document exporté avant de le déposer sur la plateforme de l'acheteur."
        : "Dernière vérification des pièces avant de produire le document Word ou PDF.",
    label: progress.exports > 0 ? fallback.label : "Ouvrir la checklist",
    segment: progress.exports > 0 ? fallback.segment : "checklist",
  };
}
