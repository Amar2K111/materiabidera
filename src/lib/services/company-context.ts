import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { METHOD_DOMAIN_LABELS } from "@/lib/company";
import { selectHybrid } from "@/lib/engine/semantic";
import { semanticSimilarities } from "./embeddings";

/**
 * Element de la base entreprise, presente au modele sous un identifiant.
 *
 * Comme pour les extraits du DCE, le modele ne manipule que des identifiants :
 * il ne peut donc pas citer une reference ou une certification qui n'existe
 * pas dans la base de l'entreprise.
 */
export type CompanyItem = {
  id: string;
  /** Table d'origine, pour retrouver la fiche. */
  table: string;
  recordId: string;
  /** Libelle affichable, du type "Reference : ecole Jean Moulin". */
  label: string;
  /** Texte transmis au modele. */
  text: string;
};

export type CompanySnapshot = {
  /** Fiches structurees (references, equipe, materiel...), identifiees C1, C2... */
  items: CompanyItem[];
  /**
   * Passages des documents de la bibliotheque (anciens memoires, CV,
   * procedures), identifies L1, L2... Citables comme les fiches.
   */
  documents: CompanyItem[];
  /** Presentation libre de l'entreprise, si elle a ete renseignee. */
  presentation: string | null;
  interventionArea: string | null;
  /** Vrai si la base ne contient aucune fiche ni aucun document exploitable. */
  isEmpty: boolean;
};

const MAX_ITEMS_PER_KIND = 40;

/** Taille d'un passage de bibliotheque transmis au moteur. */
const LIBRARY_PASSAGE_CHARS = 1500;
const MAX_LIBRARY_PASSAGES = 600;

const LIBRARY_KIND_LABELS: Record<string, string> = {
  REFERENCE: "Référence",
  MEMOIRE: "Ancien mémoire",
  METHODE: "Méthode",
  CV: "CV",
  CERTIFICATION: "Certification",
  QSE: "QSE",
  MATERIEL: "Matériel",
  AUTRE: "Document",
};

/** Assemble une vue compacte et citable de la base entreprise. */
export async function buildCompanySnapshot(
  admin: SupabaseClient,
  organizationId: string,
): Promise<CompanySnapshot> {
  const [
    org,
    references,
    employees,
    equipment,
    certifications,
    qualifications,
    methods,
    library,
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("presentation, intervention_area, activity_type")
      .eq("id", organizationId)
      .maybeSingle(),
    select(admin, "company_references", organizationId),
    select(admin, "company_employees", organizationId),
    select(admin, "company_equipment", organizationId),
    select(admin, "company_certifications", organizationId),
    select(admin, "company_qualifications", organizationId),
    select(admin, "company_methods", organizationId),
    admin
      .from("company_document_pages")
      .select(
        "document_id, page_number, label, content, company_documents (file_name, kind, status)",
      )
      .eq("organization_id", organizationId)
      .order("page_number", { ascending: true, nullsFirst: true })
      .limit(2000),
  ]);

  const items: CompanyItem[] = [];
  let counter = 0;
  const next = () => `C${(counter += 1)}`;

  for (const r of references) {
    items.push({
      id: next(),
      table: "company_references",
      recordId: r.id as string,
      label: `Référence : ${r.name}`,
      text: join([
        ["Chantier", r.name],
        ["Client", r.client],
        ["Annee", r.year],
        ["Montant", r.amount],
        ["Lot", r.lot],
        ["Nature des travaux", r.work_type],
        ["Localisation", r.location],
        ["Contraintes", r.constraints],
        ["Description", r.description],
      ]),
    });
  }

  for (const e of employees) {
    items.push({
      id: next(),
      table: "company_employees",
      recordId: e.id as string,
      label: `Équipe : ${e.full_name}`,
      text: join([
        ["Nom", e.full_name],
        ["Fonction", e.role],
        ["Experience", e.experience],
        ["Competences", e.skills],
        ["Habilitations", e.certifications],
      ]),
    });
  }

  for (const m of equipment) {
    items.push({
      id: next(),
      table: "company_equipment",
      recordId: m.id as string,
      label: `Matériel : ${m.name}`,
      text: join([
        ["Designation", m.name],
        ["Categorie", m.category],
        ["Quantite", m.quantity],
        ["Disponibilite", m.availability],
        ["Caracteristiques", m.specifications],
      ]),
    });
  }

  for (const c of certifications) {
    items.push({
      id: next(),
      table: "company_certifications",
      recordId: c.id as string,
      label: `Certification : ${c.name}`,
      text: join([
        ["Certification", c.name],
        ["Reference", c.reference],
        ["Obtenue le", c.issued_on],
        ["Valable jusqu au", c.valid_until],
        ["Precisions", c.notes],
      ]),
    });
  }

  for (const q of qualifications) {
    items.push({
      id: next(),
      table: "company_qualifications",
      recordId: q.id as string,
      label: `Qualification : ${q.name}`,
      text: join([
        ["Qualification", q.name],
        ["Domaine", q.domain],
        ["Reference", q.reference],
        ["Valable jusqu au", q.valid_until],
        ["Precisions", q.notes],
      ]),
    });
  }

  for (const m of methods) {
    items.push({
      id: next(),
      table: "company_methods",
      recordId: m.id as string,
      label: `Méthode : ${m.title}`,
      text: join([
        ["Intitule", m.title],
        ["Domaine", METHOD_DOMAIN_LABELS[String(m.domain)] ?? m.domain],
        ["Description", m.content],
      ]),
    });
  }

  // --- Bibliotheque : passages citables ---------------------------------------
  const documents: CompanyItem[] = [];
  for (const page of library.data ?? []) {
    const doc = page.company_documents as unknown as {
      file_name: string;
      kind: string;
      status: string;
    } | null;
    if (!doc || doc.status !== "EXTRACTED") continue;

    const content = String(page.content ?? "").trim();
    if (!content) continue;

    const where = page.page_number
      ? `page ${page.page_number}`
      : String(page.label ?? "");
    const parts = splitPassage(content, LIBRARY_PASSAGE_CHARS);

    parts.forEach((text, part) => {
      if (documents.length >= MAX_LIBRARY_PASSAGES) return;
      const suffix = parts.length > 1 ? ` (${part + 1}/${parts.length})` : "";
      documents.push({
        id: `L${documents.length + 1}`,
        table: "company_documents",
        recordId: page.document_id as string,
        label: `${LIBRARY_KIND_LABELS[doc.kind] ?? "Document"} : ${doc.file_name}${
          where ? `, ${where}` : ""
        }${suffix}`,
        text,
      });
    });
  }

  return {
    items,
    documents,
    presentation: (org.data?.presentation as string) ?? null,
    interventionArea: (org.data?.intervention_area as string) ?? null,
    isEmpty: items.length === 0 && documents.length === 0,
  };
}

export type EvidenceSelection = {
  /** Texte transmis au modele. */
  text: string;
  /** Elements retenus, avec leur score de pertinence. */
  selected: Array<{ id: string; label: string; score: number }>;
};

/**
 * Preuves de l'entreprise utiles a une attente precise (section, strategie).
 *
 * La presentation de l'entreprise est toujours jointe. Les fiches sont classees
 * par pertinence (une petite base est transmise en entier), et seuls les
 * passages de bibliotheque qui partagent du vocabulaire avec l'attente sont
 * retenus : on n'envoie jamais toute la base a l'aveugle.
 */
export function selectCompanyEvidence(
  snapshot: CompanySnapshot,
  query: string,
  options: {
    itemLimit?: number;
    documentLimit?: number;
    /** Proximite de sens par identifiant (C.., L..), si disponible. */
    similarities?: Map<string, number> | null;
  } = {},
): EvidenceSelection {
  const itemLimit = options.itemLimit ?? 30;
  const similarities = options.similarities ?? null;
  const rankedItems = selectHybrid(query, snapshot.items, similarities, {
    limit: itemLimit,
    keepAllBelow: itemLimit,
  });
  const rankedDocuments = selectHybrid(query, snapshot.documents, similarities, {
    limit: options.documentLimit ?? 8,
    minScore: 1,
  });

  const keptItemIds = new Set(rankedItems.map((i) => i.id));
  const keptDocumentIds = new Set(rankedDocuments.map((d) => d.id));

  const kept: CompanySnapshot = {
    ...snapshot,
    // L'ordre d'origine est conserve : la lecture reste structuree par type.
    items: snapshot.items.filter((i) => keptItemIds.has(i.id)),
    documents: snapshot.documents.filter((d) => keptDocumentIds.has(d.id)),
  };

  return {
    text: renderCompanySnapshot(kept),
    selected: [...rankedItems, ...rankedDocuments].map((x) => ({
      id: x.id,
      label: x.label,
      score: Math.round(x.score * 100) / 100,
    })),
  };
}

/**
 * Selection des preuves par le vocabulaire et par le sens.
 *
 * `queries` decrit l'attente : un seul texte pour un chapitre, plusieurs pour
 * un memoire entier (un par chapitre). Sans recherche par le sens disponible,
 * le resultat est celui de la recherche par mots-cles.
 */
export async function findCompanyEvidence(
  admin: SupabaseClient,
  organizationId: string,
  snapshot: CompanySnapshot,
  queries: string[],
  options: { itemLimit?: number; documentLimit?: number } = {},
): Promise<EvidenceSelection & { semantic: boolean }> {
  const candidates = [...snapshot.items, ...snapshot.documents].map((item) => ({
    id: item.id,
    text: `${item.label}\n${item.text}`,
  }));
  const similarities = await semanticSimilarities(admin, organizationId, queries, candidates);
  return {
    ...selectCompanyEvidence(snapshot, queries.join("\n"), { ...options, similarities }),
    semantic: similarities !== null,
  };
}

/** Met en forme la base entreprise pour le modele. */
export function renderCompanySnapshot(snapshot: CompanySnapshot): string {
  const header: string[] = [];
  if (snapshot.presentation) {
    header.push(`Presentation de l'entreprise :\n${snapshot.presentation}`);
  }
  if (snapshot.interventionArea) {
    header.push(`Zones d'intervention : ${snapshot.interventionArea}`);
  }

  const body = snapshot.items
    .map((i) => `[${i.id}] ${i.label}\n${i.text}`)
    .join("\n\n");

  const library =
    snapshot.documents.length > 0
      ? `Extraits de documents de l'entreprise :\n\n${snapshot.documents
          .map((d) => `[${d.id}] ${d.label}\n${d.text}`)
          .join("\n\n")}`
      : "";

  return [...header, body, library].filter(Boolean).join("\n\n---\n\n");
}

/** Coupe un long texte sur des fins de phrase, sans couper un mot. */
function splitPassage(text: string, size: number): string[] {
  if (text.length <= size) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > size) {
    const window = rest.slice(0, size);
    const sentence = Math.max(window.lastIndexOf(". "), window.lastIndexOf("\n"));
    const at =
      sentence > size / 2
        ? sentence + 1
        : Math.max(window.lastIndexOf(" "), Math.floor(size / 2));
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at);
  }
  if (rest.trim()) parts.push(rest.trim());
  return parts;
}

async function select(
  admin: SupabaseClient,
  table: string,
  organizationId: string,
): Promise<Array<Record<string, unknown>>> {
  const { data } = await admin
    .from(table)
    .select("*")
    .eq("organization_id", organizationId)
    .limit(MAX_ITEMS_PER_KIND);
  return data ?? [];
}

/** Assemble des paires libelle/valeur en ignorant ce qui n'est pas renseigne. */
function join(pairs: Array<[string, unknown]>): string {
  return pairs
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => `${label} : ${String(value)}`)
    .join("\n");
}
