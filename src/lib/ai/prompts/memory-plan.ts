import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

export const MemoryPlanSchema = z.object({
  sections: z
    .array(
      z.object({
        /** Numerotation affichee, du type "03". */
        number: z.string().max(10),
        title: z.string().min(3).max(160),
        /** Ce que le chapitre doit couvrir, et sous quel angle. */
        brief: z.string().min(20).max(1200),
        /** References des exigences traitees par ce chapitre. */
        requirementRefs: z.array(z.string()),
        /** Volume indicatif, en mots. */
        wordTarget: z.number().int().min(150).max(3000),
      }),
    )
    .min(3)
    .max(20),
  rationale: z.string().max(1200),
});

export type MemoryPlan = z.infer<typeof MemoryPlanSchema>;

export const MEMORY_PLAN_SYSTEM = `ROLE
Tu es responsable des appels d'offres dans une entreprise de BTP. Tu construis
le plan du memoire technique pour une consultation precise.

OBJECTIF
Produire un plan qui epouse ce marche-la, et non un plan passe-partout.

CE QUI DETERMINE LE PLAN
1. Le cadre de memoire impose par l'acheteur, s'il en existe un. Dans ce cas,
   tu suis sa structure et son intitule de chapitres, sans y deroger.
2. Les criteres de jugement et leur ponderation. Un critere fortement pondere
   merite un chapitre a lui seul, place tot dans le plan.
3. Les exigences relevees. Chaque exigence technique ou organisationnelle doit
   etre rattachee a au moins un chapitre.
4. Les particularites du marche : site occupe, phasage, coactivite, contraintes
   d'acces, interfaces techniques, enjeux environnementaux.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu n'appliques aucun plan type. Deux consultations differentes donnent deux
  plans differents.
- Le champ "brief" dit ce que le chapitre devra demontrer, en s'appuyant sur ce
  que le dossier exige. Il ne contient pas la redaction elle-meme.
- "requirementRefs" ne contient que des references presentes dans la liste des
  exigences fournie. Tu n'inventes aucune reference.
- Tu repartis les exigences : une exigence importante qui ne serait traitee
  nulle part est une erreur de plan.
- Le volume indicatif reflete le poids du chapitre dans la notation.
- "rationale" explique en quelques phrases pourquoi le plan est structure
  ainsi pour ce marche.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function memoryPlanPrompt(input: {
  projectName: string;
  dceSummary: string;
  requirements: string;
  strategy: string;
  memoryFramework: string;
}): string {
  return `Consultation : ${input.projectName}

=== ANALYSE DU DOSSIER DE CONSULTATION ===
${input.dceSummary}

=== EXIGENCES RELEVEES ===
${input.requirements}

=== STRATEGIE DE REPONSE RETENUE ===
${input.strategy}

=== CADRE DE MEMOIRE IMPOSE ===
${input.memoryFramework}

Construis le plan du memoire technique pour cette consultation.`;
}
