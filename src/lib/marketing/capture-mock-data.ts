import type { DceAnalysis, Requirement } from "@/lib/requirements";

export const CAPTURE_PROJECT = {
  name: "Rehabilitation d'un groupe scolaire",
  lot: "Lot 2 — Cloisons / plafonds",
  buyer: "Ville de Lyon",
};

const SRC = {
  documentId: "doc-rc",
  documentName: "RC.pdf",
  pageNumber: 4,
  label: "RC, art. 5.2",
};

export const CAPTURE_ANALYSIS: DceAnalysis = {
  subject: "Rehabilitation thermique et accessibilite d'un groupe scolaire",
  buyer: "Ville de Lyon — Direction de la commande publique",
  lot: "Lot 2 — Cloisons, doublages et plafonds",
  amount: "458 000 EUR HT",
  duration: "12 semaines de travaux",
  submission_date: "18 avril 2026 — 12h00",
  variants: "Sans variante",
  site_visit: "Visite obligatoire le 28 mars 2026",
  award_criteria: [
    {
      label: "Valeur technique",
      weight: "60 %",
      detail: "Moyens humains, methodologie de chantier occupe, planning.",
      sources: [SRC],
    },
    {
      label: "Prix des prestations",
      weight: "40 %",
      detail: "DPGF lot 2.",
      sources: [{ ...SRC, label: "RC, art. 6.1" }],
    },
  ],
  vigilance_points: [
    {
      title: "Visite de site obligatoire",
      detail: "Presence attestee requise avant remise de l'offre.",
      severity: "HIGH",
      sources: [SRC],
    },
    {
      title: "Planning detaille exige",
      detail: "Le memoire doit inclure un phasage compatible avec la scolarite.",
      severity: "MEDIUM",
      sources: [{ ...SRC, documentName: "CCTP.pdf", label: "CCTP, §3.4" }],
    },
  ],
  provider: "gemini",
  model: "gemini-2.0-flash",
  generated_at: "2026-03-12T10:30:00.000Z",
};

export const CAPTURE_REQUIREMENTS: Requirement[] = [
  {
    id: "req-1",
    text: "Presente une equipe dediee avec conducteur de travaux nomme",
    category: "MOYENS",
    priority: "HIGH",
    status: "COVERED",
    expected_answer: "Organigramme et CV du conducteur",
    current_answer: "Equipe identifiee dans la base entreprise",
    is_manual: false,
    position: 1,
    requirement_sources: [
      {
        id: "s1",
        document_id: "doc-cctp",
        page_number: 12,
        label: "CCTP, §2.1",
        quote: "Le candidat justifiera des moyens humains affectes au chantier.",
        project_documents: { file_name: "CCTP.pdf" },
      },
    ],
  },
  {
    id: "req-2",
    text: "Decrire la methodologie de chantier occupe",
    category: "TECHNIQUE",
    priority: "HIGH",
    status: "TO_HANDLE",
    expected_answer: "Phasage, protections, acces maintenus",
    current_answer: null,
    is_manual: false,
    position: 2,
    requirement_sources: [
      {
        id: "s2",
        document_id: "doc-cctp",
        page_number: 18,
        label: "CCTP, §3.4",
        quote: null,
        project_documents: { file_name: "CCTP.pdf" },
      },
    ],
  },
  {
    id: "req-3",
    text: "Justifier des references de travaux en milieu scolaire",
    category: "REFERENCE",
    priority: "MEDIUM",
    status: "COVERED",
    expected_answer: "2 references < 5 ans",
    current_answer: "College Jean Moulin — 2024",
    is_manual: false,
    position: 3,
    requirement_sources: [
      {
        id: "s3",
        document_id: "doc-rc",
        page_number: 9,
        label: "RC, art. 4.3",
        quote: null,
        project_documents: { file_name: "RC.pdf" },
      },
    ],
  },
  {
    id: "req-4",
    text: "Planning detaille compatible avec la periode scolaire",
    category: "DELAI",
    priority: "HIGH",
    status: "MISSING",
    expected_answer: "Diagramme Gantt sur 12 semaines",
    current_answer: null,
    is_manual: false,
    position: 4,
    requirement_sources: [
      {
        id: "s4",
        document_id: "doc-cctp",
        page_number: 22,
        label: "CCTP, §4.2",
        quote: null,
        project_documents: { file_name: "CCTP.pdf" },
      },
    ],
  },
];

export const CAPTURE_COMPANY_COUNTS: Record<string, number> = {
  company_references: 4,
  company_employees: 6,
  company_equipment: 3,
  company_certifications: 2,
  company_qualifications: 2,
  company_methods: 5,
};

export const CAPTURE_HERO = {
  orgName: "Roux TP",
  initials: "RT",
  metrics: [
    { label: "Dossiers actifs", value: "4" },
    { label: "Dossiers a traiter", value: "2" },
    { label: "Memoires en cours", value: "3" },
    { label: "Echeances proches", value: "1", tone: "is-warn" as const },
  ],
  projects: [
    {
      name: "Rehabilitation d'un groupe scolaire",
      buyer: "Ville de Lyon",
      lot: "Lot 2 — Cloisons / plafonds",
      status: { label: "Memoire en cours", tone: "is-ok" as const },
      score: 78,
      decision: { label: "GO", tone: "is-ok" as const },
      memoryProgress: 62,
      deadline: "18 avr. 2026",
      due: { text: "J-12", tone: "warn" as const },
    },
    {
      name: "Extension mairie annexe",
      buyer: "Mairie de Grenoble",
      lot: "Lot unique — Gros oeuvre",
      status: { label: "Analyse DCE", tone: "is-brand" as const },
      score: 65,
      decision: { label: "Sous reserve", tone: "is-warn" as const },
      memoryProgress: 18,
      deadline: "2 mai 2026",
      due: { text: "J-26", tone: "neutral" as const },
    },
  ],
};

export const CAPTURE_MEMORY = {
  progress: 62,
  selected: {
    number: 3,
    title: "Methodologie et phasage du chantier",
    status: "GENERATED" as const,
    brief:
      "Decrire l'organisation du chantier occupe, les protections et la coordination avec l'etablissement.",
    content: `Notre methodologie s'appuie sur un phasage en 4 sequences compatibles avec la periode scolaire.

**Sequence 1 — Preparatoire (S1-S2)**  
Installation de base, protections des circulations, balisage des zones d'intervention.

**Sequence 2 — Cloisons legeres (S3-S6)**  
Intervention en zones decoupees, travaux de jour uniquement dans les espaces occupes.

**Sequence 3 — Plafonds (S7-S10)**  
Coordination avec le lot electricite, controle acoustique avant remise.

**Sequence 4 — Finitions (S11-S12)**  
Reception partielle par batiment, levees de reserves sous 48 h.`,
  },
  sections: [
    { number: 1, title: "Presentation de l'entreprise", done: true },
    { number: 2, title: "Comprehension du besoin", done: true },
    { number: 3, title: "Methodologie et phasage", done: true },
    { number: 4, title: "Moyens humains et materiels", done: false },
    { number: 5, title: "Qualite / securite / environnement", done: false },
  ],
};
