import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractionOf, ExtractionError } from "@/lib/extraction";
import { extensionOf } from "@/lib/documents";

export type CompanyIngestOutcome = {
  documentId: string;
  fileName: string;
  status: "EXTRACTED" | "FAILED";
  message?: string;
  pageCount?: number | null;
};

/**
 * Lit une piece de la bibliotheque entreprise et en conserve le texte.
 *
 * Ce texte devient une source citable : un ancien memoire ou une fiche de
 * reference pourra etre invoque a l'appui d'une redaction, avec sa provenance.
 */
export async function ingestNextCompanyDocument(input: {
  organizationId: string;
}): Promise<CompanyIngestOutcome | null> {
  const admin = createAdminClient();

  const { data: doc } = await admin
    .from("company_documents")
    .select("id, file_name, storage_path")
    .eq("organization_id", input.organizationId)
    .eq("status", "UPLOADED")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!doc) return null;

  const documentId = doc.id as string;
  const fileName = doc.file_name as string;

  await admin
    .from("company_documents")
    .update({ status: "EXTRACTING" })
    .eq("id", documentId);

  const fail = async (message: string): Promise<CompanyIngestOutcome> => {
    await admin
      .from("company_documents")
      .update({ status: "FAILED", failure_reason: message })
      .eq("id", documentId);
    return { documentId, fileName, status: "FAILED", message };
  };

  try {
    // Une archive n'a pas de sens ici : chaque piece se depose individuellement.
    if (extensionOf(fileName) === "zip") {
      return await fail(
        "Deposez les fichiers un par un plutot qu'en archive pour cette section.",
      );
    }

    const { data: file, error: downloadError } = await admin.storage
      .from("entreprise")
      .download(doc.storage_path as string);

    if (downloadError || !file) {
      return await fail("Le fichier n'a pas pu etre recupere depuis le stockage.");
    }

    const result = await extractionOf(
      new Uint8Array(await file.arrayBuffer()),
      fileName,
    );

    if (result.needsOcr) {
      return await fail(
        "Ce document est un scan sans texte selectionnable. Fournissez une version texte pour qu'il puisse servir de source.",
      );
    }

    if (result.units.length === 0) {
      return await fail("Ce document ne contient aucun texte exploitable.");
    }

    await admin
      .from("company_document_pages")
      .delete()
      .eq("document_id", documentId);

    await admin.from("company_document_pages").insert(
      result.units.map((u) => ({
        organization_id: input.organizationId,
        document_id: documentId,
        page_number: u.pageNumber,
        label: u.label,
        content: u.text,
        char_count: u.text.length,
      })),
    );

    await admin
      .from("company_documents")
      .update({
        status: "EXTRACTED",
        page_count: result.pageCount,
        failure_reason: null,
      })
      .eq("id", documentId);

    return {
      documentId,
      fileName,
      status: "EXTRACTED",
      pageCount: result.pageCount,
    };
  } catch (error) {
    return fail(
      error instanceof ExtractionError
        ? error.userMessage
        : "Ce document n'a pas pu etre lu.",
    );
  }
}
