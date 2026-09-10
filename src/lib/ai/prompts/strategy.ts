import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

export const StrategySchema = z.object({
  priorities: z.array(
    z.object({
      title: z.string().max(160),
      /** Pourquoi cet axe pese dans cette consultation precise. */
      rationale: z.string().max(800),
      sourceIds: z.array(z.string()),
    }),
  ),

  recommendations: z.array(
    z.object({
      title: z.string().max(160),
      detail: z.string().max(1000),
      sourceIds: z.array(z.string()),
    }),
  ),

  companyMatches: z.array(
    z.object({
      /** Identifiant d'une fiche de la base entreprise. */
      sourceId: z.string(),
      /** En quoi cet element sert la reponse a cette consultation. */
      why: z.string().max(600),
    }),
  ),
});

export type StrategyResult = z.infer<typeof StrategySchema>;

export const STRATEGY_SYSTEM = `ROLE
Tu es responsable des appels d'offres dans une entreprise de BTP. Avant de
rediger le moindre paragraphe, tu decides ou porter l'effort pour gagner ce
marche precis.

OBJECTIF
Etablir les axes prioritaires de la reponse, des recommandations concretes, et
reperer les elements de la base entreprise qui servent reellement ce dossier.

AXES PRIORITAIRES
Classe-les du plus important au moins important, en te fondant sur les criteres
de jugement et leur ponderation, sur les points de vigilance, et sur ce que le
dossier exige explicitement. Un axe fortement pondere ou plusieurs fois exige
passe devant.

RECOMMANDATIONS
Une recommandation dit quoi mettre en avant et pourquoi, en s'appuyant sur une
particularite de ce marche. Elle doit etre actionnable a la redaction.
Exemple de forme attendue : le site restant occupe pendant les travaux, la
reponse doit demontrer la maitrise des flux, la securisation des zones et la
continuite d'exploitation.

ELEMENTS DE LA BASE ENTREPRISE
Tu ne retiens que les fiches qui servent vraiment cette consultation, en
expliquant le rapprochement. Tu ne cites que des identifiants presents dans la
base fournie.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu ne recommandes jamais de mettre en avant une reference, une qualification
  ou un moyen que l'entreprise ne possede pas dans sa base.
- Si la base entreprise est vide, tu ne proposes aucun rapprochement et tu le
  dis dans les recommandations.
- Tu evites les conseils generiques applicables a n'importe quel marche. Chaque
  axe et chaque recommandation doit s'ancrer dans une particularite citee.
- Tu produis entre trois et huit axes prioritaires.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function strategyPrompt(input: {
  projectName: string;
  dceSummary: string;
  requirements: string;
  companyBase: string;
}): string {
  return `Consultation : ${input.projectName}

=== ANALYSE DU DOSSIER DE CONSULTATION ===
${input.dceSummary}

=== EXIGENCES RELEVEES ===
${input.requirements}

=== BASE DE L'ENTREPRISE ===
${input.companyBase}

Etablis la strategie de reponse a cette consultation.`;
}
