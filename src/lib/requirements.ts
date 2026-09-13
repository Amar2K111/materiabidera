/**
 * Types et libelles partages entre serveur et navigateur.
 *
 * Ce module ne doit contenir aucune dependance serveur : il est importe par
 * des composants client, qui ne peuvent pas embarquer l'acces a la base.
 */

export type CitedSource = {
  documentId: string;
  documentName: string;
  pageNumber: number | null;
  label: string;
};

export type AwardCriterion = {
  label: string;
  weight: string;
  detail: string;
  sources: CitedSource[];
};

export type VigilancePoint = {
  title: string;
  detail: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  sources: CitedSource[];
};

export type DceAnalysis = {
  subject: string | null;
  buyer: string | null;
  lot: string | null;
  amount: string | null;
  duration: string | null;
  submission_date: string | null;
  variants: string | null;
  site_visit: string | null;
  award_criteria: AwardCriterion[];
  vigilance_points: VigilancePoint[];
  provider: string | null;
  model: string | null;
  generated_at: string;
};

export type RequirementCategory =
  | "ADMINISTRATIF"
  | "TECHNIQUE"
  | "MOYENS"
  | "DELAI"
  | "QSE"
  | "FINANCIER"
  | "REFERENCE"
  | "AUTRE";

export type RequirementStatus = "COVERED" | "TO_HANDLE" | "MISSING";

export type RequirementSource = {
  id: string;
  document_id: string | null;
  page_number: number | null;
  label: string | null;
  quote: string | null;
  project_documents: { file_name: string } | null;
};

export type Requirement = {
  id: string;
  text: string;
  category: RequirementCategory;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: RequirementStatus;
  expected_answer: string | null;
  current_answer: string | null;
  is_manual: boolean;
  position: number;
  requirement_sources: RequirementSource[];
};

export const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  ADMINISTRATIF: "Administratif",
  TECHNIQUE: "Technique",
  MOYENS: "Moyens",
  DELAI: "Délai",
  QSE: "QSE",
  FINANCIER: "Financier",
  REFERENCE: "Référence",
  AUTRE: "Autre",
};

export const STATUS_LABELS: Record<
  RequirementStatus,
  { label: string; tone: "ok" | "warn" | "risk" }
> = {
  COVERED: { label: "Couvert", tone: "ok" },
  TO_HANDLE: { label: "À traiter", tone: "warn" },
  MISSING: { label: "Manquant", tone: "risk" },
};

export const PRIORITY_LABELS: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
};

/** Une meme page citee par plusieurs extraits n'est affichee qu'une fois. */
export function dedupeCited(sources: CitedSource[]): CitedSource[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = `${s.documentName}|${s.pageNumber ?? s.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Libelle de source affichable, du type "RC.pdf, page 18". */
export function sourceLabel(source: RequirementSource): string {
  const name = source.project_documents?.file_name ?? "Document";
  const where = source.page_number
    ? `page ${source.page_number}`
    : (source.label ?? "");
  return where ? `${name}, ${where}` : name;
}
