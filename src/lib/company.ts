/**
 * Definition des collections de la base entreprise.
 *
 * Les six collections partagent la meme mecanique : lister, ajouter, modifier,
 * supprimer. Les decrire une fois evite six ecrans quasi identiques, sans pour
 * autant masquer ce que chacune contient.
 */

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  /** Occupe toute la largeur du formulaire. */
  wide?: boolean;
};

export type CollectionDef = {
  slug: string;
  table: string;
  /** Titre de la page. */
  title: string;
  /** Phrase expliquant a quoi sert cette collection. */
  purpose: string;
  /** Texte de l'etat vide. */
  emptyDescription: string;
  addLabel: string;
  /** Champ portant le titre d'une fiche. */
  titleField: string;
  /** Champs resumes dans la liste. */
  summaryFields: string[];
  fields: FieldDef[];
};

const METHOD_DOMAINS = [
  { value: "CHANTIER", label: "Conduite de chantier" },
  { value: "QUALITE", label: "Qualite" },
  { value: "SECURITE", label: "Securite" },
  { value: "ENVIRONNEMENT", label: "Environnement" },
  { value: "ORGANISATION", label: "Organisation" },
  { value: "AUTRE", label: "Autre" },
];

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: "references",
    table: "company_references",
    title: "References",
    purpose:
      "Vos chantiers realises. Ce sont eux qui prouvent votre experience face a une consultation.",
    emptyDescription:
      "Ajoutez vos chantiers realises. BIDERA s'en sert pour reperer ceux qui ressemblent au marche analyse, et pour les proposer dans votre memoire technique.",
    addLabel: "Ajouter une reference",
    titleField: "name",
    summaryFields: ["client", "year", "amount", "work_type"],
    fields: [
      {
        key: "name",
        label: "Nom du chantier",
        type: "text",
        required: true,
        placeholder: "Ex. Rehabilitation de l'ecole Jean Moulin",
        wide: true,
      },
      { key: "client", label: "Client", type: "text" },
      { key: "year", label: "Annee", type: "number", placeholder: "2025" },
      { key: "amount", label: "Montant", type: "text", placeholder: "Ex. 1 240 000 EUR HT" },
      { key: "lot", label: "Lot", type: "text" },
      { key: "work_type", label: "Nature des travaux", type: "text" },
      { key: "location", label: "Localisation", type: "text" },
      {
        key: "constraints",
        label: "Contraintes rencontrees",
        type: "textarea",
        wide: true,
        hint: "Site occupe, phasage, coactivite, delais tenus, nuisances maitrisees.",
      },
      { key: "description", label: "Description", type: "textarea", wide: true },
    ],
  },
  {
    slug: "equipe",
    table: "company_employees",
    title: "Equipe",
    purpose:
      "Les moyens humains que vous pouvez affecter a un chantier, avec leurs competences.",
    emptyDescription:
      "Ajoutez les personnes que vous engagez sur vos chantiers. Leurs fonctions et competences alimentent la partie moyens humains de vos memoires.",
    addLabel: "Ajouter une personne",
    titleField: "full_name",
    summaryFields: ["role", "experience"],
    fields: [
      {
        key: "full_name",
        label: "Nom et prenom",
        type: "text",
        required: true,
        wide: true,
      },
      { key: "role", label: "Fonction", type: "text", placeholder: "Ex. Conducteur de travaux" },
      { key: "experience", label: "Experience", type: "text", placeholder: "Ex. 12 ans" },
      { key: "skills", label: "Competences", type: "textarea", wide: true },
      {
        key: "certifications",
        label: "Habilitations et certifications",
        type: "textarea",
        wide: true,
      },
    ],
  },
  {
    slug: "materiel",
    table: "company_equipment",
    title: "Materiel",
    purpose:
      "Les moyens materiels dont vous disposez en propre, et leur disponibilite.",
    emptyDescription:
      "Ajoutez votre materiel. Il sert a demontrer que vous disposez des moyens exiges par la consultation.",
    addLabel: "Ajouter du materiel",
    titleField: "name",
    summaryFields: ["category", "quantity", "availability"],
    fields: [
      { key: "name", label: "Designation", type: "text", required: true, wide: true },
      { key: "category", label: "Categorie", type: "text", placeholder: "Ex. Levage" },
      { key: "quantity", label: "Quantite", type: "text" },
      { key: "availability", label: "Disponibilite", type: "text", placeholder: "Ex. En propre" },
      {
        key: "specifications",
        label: "Caracteristiques",
        type: "textarea",
        wide: true,
      },
    ],
  },
  {
    slug: "certifications",
    table: "company_certifications",
    title: "Certifications",
    purpose:
      "Vos certifications en cours de validite, avec leurs dates et references.",
    emptyDescription:
      "Ajoutez vos certifications. Une consultation qui en exige une pourra ainsi etre confrontee a ce que vous detenez reellement.",
    addLabel: "Ajouter une certification",
    titleField: "name",
    summaryFields: ["reference", "valid_until"],
    fields: [
      { key: "name", label: "Certification", type: "text", required: true, wide: true },
      { key: "reference", label: "Numero ou reference", type: "text" },
      { key: "issued_on", label: "Date d'obtention", type: "date" },
      { key: "valid_until", label: "Valable jusqu'au", type: "date" },
      { key: "notes", label: "Precisions", type: "textarea", wide: true },
    ],
  },
  {
    slug: "qualifications",
    table: "company_qualifications",
    title: "Qualifications",
    purpose:
      "Vos qualifications professionnelles et les domaines qu'elles couvrent.",
    emptyDescription:
      "Ajoutez vos qualifications, par exemple Qualibat ou RGE, avec leur domaine. Elles sont frequemment exigees dans les reglements de consultation.",
    addLabel: "Ajouter une qualification",
    titleField: "name",
    summaryFields: ["domain", "reference", "valid_until"],
    fields: [
      { key: "name", label: "Qualification", type: "text", required: true, wide: true },
      { key: "domain", label: "Domaine", type: "text" },
      { key: "reference", label: "Reference", type: "text" },
      { key: "valid_until", label: "Valable jusqu'au", type: "date" },
      { key: "notes", label: "Precisions", type: "textarea", wide: true },
    ],
  },
  {
    slug: "methodes",
    table: "company_methods",
    title: "Methodes",
    purpose:
      "Vos facons de faire : conduite de chantier, qualite, securite, environnement.",
    emptyDescription:
      "Decrivez vos methodes de travail. Elles evitent les reponses generiques : votre memoire s'appuiera sur vos procedures reelles, pas sur des formules toutes faites.",
    addLabel: "Ajouter une methode",
    titleField: "title",
    summaryFields: ["domain"],
    fields: [
      { key: "title", label: "Intitule", type: "text", required: true, wide: true },
      {
        key: "domain",
        label: "Domaine",
        type: "select",
        options: METHOD_DOMAINS,
      },
      { key: "content", label: "Description", type: "textarea", wide: true },
    ],
  },
];

export function findCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export const METHOD_DOMAIN_LABELS: Record<string, string> = Object.fromEntries(
  METHOD_DOMAINS.map((d) => [d.value, d.label]),
);

/** Valeur affichable d'un champ dans la liste. */
export function displayValue(
  field: FieldDef | undefined,
  value: unknown,
): string {
  if (value === null || value === undefined || value === "") return "";
  if (field?.type === "select" && field.options) {
    return field.options.find((o) => o.value === value)?.label ?? String(value);
  }
  if (field?.type === "date") {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString("fr-FR");
  }
  return String(value);
}
