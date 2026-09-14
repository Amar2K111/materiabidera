import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

/**
 * Controle 2 : affirmations, coherence et pertinence (sections 18, 21 et 22).
 */
export const ClaimsReviewSchema = z.object({
  claims: z.array(
    z.object({
      sectionRef: z.string(),
      /** Passage exact du memoire contenant l'affirmation. */
      text: z.string().max(400),
      type: z.enum([
        "PERSONNEL",
        "EXPERIENCE",
        "EQUIPMENT",
        "CERTIFICATION",
        "REFERENCE",
        "FIGURE",
        "PROCEDURE",
        "COMMITMENT",
        "OTHER",
      ]),
      status: z.enum(["supported", "partially_supported", "unsupported", "needs_validation"]),
      importance: z.enum(["HIGH", "MEDIUM", "LOW"]),
      /** Identifiants des elements qui la prouvent ("C3", "L2", "E5"). */
      evidenceIds: z.array(z.string()),
      /** Ce qui manque pour la prouver, ou pourquoi elle est a valider. */
      note: z.string().max(400),
    }),
  ),

  consistency: z.array(
    z.object({
      description: z.string().max(500),
      sectionRefs: z.array(z.string()),
      severity: z.enum(["HIGH", "MEDIUM"]),
    }),
  ),

  generic: z.array(
    z.object({
      sectionRef: z.string(),
      /** Passage fautif, recopie. */
      excerpt: z.string().max(300),
      reason: z.string().max(300),
      /** Comment le contextualiser, le prouver, le raccourcir ou le supprimer. */
      suggestion: z.string().max(300),
    }),
  ),

  missingInformation: z.array(
    z.object({
      question: z.string().max(300),
      criterion: z.string().max(200).nullable(),
      impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
    }),
  ),
});

export type ClaimsReview = z.infer<typeof ClaimsReviewSchema>;

export const CLAIMS_SYSTEM = `ROLE
Tu es le verificateur d'une entreprise de BTP. Avant la remise, tu confrontes
chaque affirmation factuelle du memoire technique aux donnees reelles de
l'entreprise et du dossier.

AFFIRMATIONS A CONTROLER
Toute affirmation factuelle sur l'entreprise : personnes, effectifs,
experience, materiel, quantites, certifications, qualifications, references,
clients, chiffres, delais internes, procedures, engagements. Tu ignores les
simples reformulations du dossier et les phrases sans contenu factuel.

STATUT
- supported : un element fourni (base entreprise "C"/"L" ou dossier "E"/"R")
  confirme l'affirmation. Tu cites son identifiant.
- partially_supported : une partie seulement est confirmee (par exemple la
  personne existe mais l'experience annoncee n'est pas indiquee).
- unsupported : aucun element ne la confirme. C'est une affirmation possiblement
  inventee.
- needs_validation : engagement plausible mais qui engage l'entreprise sans
  appui (par exemple un delai de mobilisation), a faire valider.
IMPORTANCE : HIGH si l'affirmation pese sur la notation ou engage
contractuellement ; LOW si elle est accessoire.

COHERENCE
Tu releves les contradictions entre chapitres (effectifs, personnes, materiels,
delais, methodes, planning) et les engagements incompatibles avec le dossier.
HIGH si la contradiction serait relevee par l'acheteur ou fausse un engagement.

CONTENU GENERIQUE
Tu releves les passages qui pourraient etre envoyes presque sans modification
pour un autre marche : slogans, engagements vagues, generalites non prouvees.

INFORMATIONS A DEMANDER
Au plus cinq informations absentes de la base entreprise dont l'ajout
renforcerait nettement le memoire, classees par impact.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- "text" et "excerpt" sont recopies du memoire, sans reformulation.
- Une contradiction entre chapitres est signalee UNE seule fois, dans
  "consistency". Les affirmations concernees ne sont classees "unsupported"
  que si, en plus, aucun element fourni ne les confirme.
- "suggestion" et "note" disent quoi faire (preciser, prouver, supprimer,
  reformuler en s'appuyant sur tel element). Ils ne proposent jamais de phrase
  toute faite contenant un fait, un chiffre, un materiel ou un dispositif
  absent des donnees fournies.
- "note" et "description" designent les chapitres par leur titre, jamais par
  leur reference ("S2").
- Tu ne cites que des identifiants presents dans les donnees fournies.
- Une liste vide est une reponse acceptable : tu n'inventes pas de probleme.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function claimsPrompt(input: {
  projectName: string;
  marketFacts: string;
  requirements: string;
  companyBase: string;
  memory: string;
}) {
  return `Consultation : ${input.projectName}

=== DONNEES DU MARCHE ===
${input.marketFacts}

=== EXIGENCES (R...) ===
${input.requirements}

=== DONNEES REELLES DE L'ENTREPRISE (seules preuves admises) ===
${input.companyBase}

=== MEMOIRE TECHNIQUE (chapitres S1, S2...) ===
${input.memory}

Controle les affirmations, la coherence et la pertinence de ce memoire.`;
}
