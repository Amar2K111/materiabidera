"use client";

import { guessKindFromName } from "@/lib/documents";
import { DocumentUploader } from "@/components/app/document-uploader";

/** Depot des pieces d'un DCE, dans le bucket prive du dossier concerne. */
export function DceUploader({
  organizationId,
  projectId,
  onUploaded,
}: {
  organizationId: string;
  projectId: string;
  onUploaded?: (count: number) => void;
}) {
  return (
    <DocumentUploader
      organizationId={organizationId}
      onUploaded={onUploaded}
      title="Deposez les pieces du DCE"
      description="Glissez vos fichiers ici, ou parcourez votre ordinateur. Formats acceptes : PDF, DOC, DOCX, XLS, XLSX et ZIP."
      target={{
        bucket: "dce",
        table: "project_documents",
        pathSegments: [projectId],
        extraColumns: { project_id: projectId },
        kindOf: guessKindFromName,
      }}
    />
  );
}
