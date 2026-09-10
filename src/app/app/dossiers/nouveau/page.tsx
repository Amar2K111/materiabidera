import { getAppContext } from "@/lib/data/context";
import { NewProjectFlow } from "./new-project-flow";

export default async function NouveauDossierPage() {
  const ctx = await getAppContext();
  if (!ctx?.organization) return null;

  return <NewProjectFlow organizationId={ctx.organization.id} />;
}
