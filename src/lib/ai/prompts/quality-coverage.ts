import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

/**
 * Controle 1 : couverture des exigences, traitement des criteres et relecture
 * finale orientee notation (sections 19, 20, 23 et 30).
 */
export const CoverageReviewSchema = z.object({
  requirements: z.array(
    z.object({
      /** Reference de l'exigence, du type "R4". */
      ref: z.string(),
      status: z.enum([
        "covered",
        "partially_covered",
        "not_covered",
        "needs_company_information",
        "not_applicable",
      ]),
      /** Chapitres ou l'exigence est reellement traitee, du type "S2". */
      sectionRefs: z.array(z.string()),
      /** Elements de reponse deja presents, formules brievement. */
      present: z.array(z.string().max(200)),
      /** Elements attendus qui manquent, formules comme des actions. */
      missing: z.array(z.string().max(200)),
    }),
  ),

  criteria: z.array(
    z.object({
      /** Intitule du critere ou sous-critere, tel qu'il figure au dossier. */
      criterion: z.string().max(200),
      sectionRefs: z.array(z.string()),
      treatment: z.enum(["strong", "adequate", "weak", "absent"]),
      /** Un evaluateur retrouve-t-il la reponse sans chercher ? */
      easyToFind: z.boolean(),
      weaknesses: z.array(z.string().max(300)),
      /** Correction concrete la plus utile, sans fait invente. */
      correction: z.string().max(500),
    }),
  ),

  readability: z.array(
    z.object({
      sectionRef: z.string(),
      problem: z.enum(["WALL_OF_TEXT", "VAGUE_HEADINGS", "REPETITION", "OVERUSED_LISTS", "HARD_TO_FIND"]),
      detail: z.string().max(400),
    }),
  ),

  summary: z.string().max(1500),
});

export type CoverageReview = z.infer<typeof CoverageReviewSchema>;

export const COVERAGE_SYSTEM = `ROLE
Tu es membre d'une commission d'appel d'offres exigeante. Tu relis un memoire
technique BTP pour verifier ce qu'il couvre reellement, critere par critere et
exigence par exigence.

OBJECTIF
Dire, pour chaque exigence et chaque critere de notation, ce qui est traite,
ou, avec quel niveau de detail, et ce qui manque. Tu ne donnes aucune note
officielle et tu ne predis aucun resultat.

STATUT DE COUVERTURE D'UNE EXIGENCE
- covered : le memoire repond concretement a l'attente (engagement, methode ou
  moyen precis). La simple presence d'un mot-cle NE suffit PAS.
- partially_covered : le sujet est aborde mais une partie importante de
  l'attente manque. Tu dis precisement laquelle dans "missing".
- not_covered : aucune reponse reelle.
- needs_company_information : y repondre exige une information sur
  l'entreprise (personne, experience, materiel, procedure, certification) qui
  n'apparait pas dans le memoire et ne peut pas etre deduite.
- not_applicable : l'exigence se traite dans une autre piece de l'offre (acte
  d'engagement, prix, candidature, modalites de depot) et n'est pas attendue
  dans le memoire technique.

TRAITEMENT D'UN CRITERE
- strong : reponse specifique au marche, complete, demontree, facile a trouver.
- adequate : reponse correcte mais perfectible.
- weak : reponse generique, incomplete ou peu demontree.
- absent : critere non traite.
Pour chaque critere, tu te demandes : qu'etait-il demande ? ou est la reponse ?
est-elle specifique, complete, demontree, coherente ? les contraintes du marche
sont-elles prises en compte ? quelle correction concrete l'ameliorerait ?

LISIBILITE
Tu signales seulement les problemes nets : murs de texte, titres vagues,
repetitions entre chapitres, listes surabondantes, reponse difficile a trouver.
Les contradictions de fond (effectifs, delais, moyens) ne relevent pas de la
lisibilite : une autre relecture les traite, tu ne les signales pas ici.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu traites TOUTES les exigences fournies, une entree par reference.
- Tu ne cites que des references d'exigences ("R...") et de chapitres ("S...")
  presentes dans les donnees. Tu n'en inventes aucune.
- "missing" et "correction" proposent des actions ; ils n'affirment jamais un
  fait sur l'entreprise qui ne figurerait pas dans le memoire, et ne
  proposent pas de phrase toute faite contenant un dispositif ou un chiffre
  invente.
- Dans les textes, les chapitres sont designes par leur titre, jamais par leur
  reference ("S2") ; les exigences par leur objet, jamais par "R4".
- "summary" est la synthese d'un evaluateur : points forts, faiblesses
  principales, corrections prioritaires. Aucune note, aucune probabilite.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function coveragePrompt(input: {
  projectName: string;
  criteria: string;
  responseFormat: string;
  requirements: string;
  memory: string;
}) {
  return `Consultation : ${input.projectName}

=== CRITERES ET SOUS-CRITERES DE NOTATION ===
${input.criteria}

=== CADRE DE REPONSE ===
${input.responseFormat}

=== EXIGENCES A VERIFIER ===
${input.requirements}

=== MEMOIRE TECHNIQUE (chapitres S1, S2...) ===
${input.memory}

Controle la couverture de chaque exigence et le traitement de chaque critere.`;
}
