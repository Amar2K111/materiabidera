"use client";

import { ErrorScreen } from "@/components/app/error-screen";

export default function ProjectStepError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorScreen
      error={error}
      retry={retry}
      title="Cette étape n'a pas pu s'afficher"
      description="Une erreur est survenue pendant le chargement de l'étape."
      backHref="/app/dossiers"
      backLabel="Retour aux dossiers"
    />
  );
}
