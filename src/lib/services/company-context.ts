import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { METHOD_DOMAIN_LABELS } from "@/lib/company";

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
  items: CompanyItem[];
  /** Presentation libre de l'entreprise, si elle a ete renseignee. */
  presentation: string | null;
  interventionArea: string | null;
  /** Vrai si la base ne contient aucune fiche exploitable. */
  isEmpty: boolean;
};

const MAX_ITEMS_PER_KIND = 40;

/** Assemble une vue compacte et citable de la base entreprise. */
export async function buildCompanySnapshot(
  admin: SupabaseClient,
  organizationId: string,
): Promise<CompanySnapshot> {
  const [org, references, employees, equipment, certifications, qualifications, methods] =
    await Promise.all([
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
    ]);

  const items: CompanyItem[] = [];
  let counter = 0;
  const next = () => `C${(counter += 1)}`;

  for (const r of references) {
    items.push({
      id: next(),
      table: "company_references",
      recordId: r.id as string,
      label: `Reference : ${r.name}`,
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
      label: `Equipe : ${e.full_name}`,
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
      label: `Materiel : ${m.name}`,
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
      label: `Methode : ${m.title}`,
      text: join([
        ["Intitule", m.title],
        ["Domaine", METHOD_DOMAIN_LABELS[String(m.domain)] ?? m.domain],
        ["Description", m.content],
      ]),
    });
  }

  return {
    items,
    presentation: (org.data?.presentation as string) ?? null,
    interventionArea: (org.data?.intervention_area as string) ?? null,
    isEmpty: items.length === 0,
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

  return [...header, body].filter(Boolean).join("\n\n---\n\n");
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
