import { getAppContext } from "@/lib/data/context";
import { listCompanyDocuments } from "@/lib/data/company";
import { PageHeader } from "@/components/ui/page-header";
import { LibrarySection } from "./library-section";
import { CompanySearch } from "@/components/app/company-search";

export default async function BibliothequePage() {
  const [ctx, documents] = await Promise.all([
    getAppContext(),
    listCompanyDocuments(),
  ]);

  if (!ctx?.organization) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bibliothèque"
        subtitle="Vos documents exploitables comme sources : anciens mémoires, fiches de référence, CV, certifications et documents QSE."
      />
      <CompanySearch />
      <LibrarySection
        organizationId={ctx.organization.id}
        documents={documents}
      />
    </div>
  );
}
