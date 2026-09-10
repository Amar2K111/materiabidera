import { getAppContext } from "@/lib/data/context";
import { listCompanyDocuments } from "@/lib/data/company";
import { PageHeader } from "@/components/ui/page-header";
import { LibrarySection } from "./library-section";

export default async function BibliothequePage() {
  const [ctx, documents] = await Promise.all([
    getAppContext(),
    listCompanyDocuments(),
  ]);

  if (!ctx?.organization) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bibliotheque"
        subtitle="Vos documents exploitables comme sources : anciens memoires, fiches de reference, CV, certifications et documents QSE."
      />
      <LibrarySection
        organizationId={ctx.organization.id}
        documents={documents}
      />
    </div>
  );
}
