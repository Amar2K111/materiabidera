"use client";

import { ErrorScreen } from "@/components/app/error-screen";

export default function AppError({
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
      title="Cette page n'a pas pu s'afficher"
      description="Une erreur est survenue pendant le chargement."
      backHref="/app"
      backLabel="Retour au tableau de bord"
    />
  );
}
