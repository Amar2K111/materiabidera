import { MissingScreen } from "@/components/app/error-screen";

/** Dossier supprime, ou appartenant a une autre entreprise. */
export default function ProjectNotFound() {
  return (
    <MissingScreen
      title="Ce dossier est introuvable"
      description="Il a peut-être été supprimé, ou le lien pointe vers un dossier qui n'appartient pas à votre entreprise."
      backHref="/app/dossiers"
      backLabel="Voir tous les dossiers"
    />
  );
}
