import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

export const DocumentClassificationSchema = z.object({
  kind: z.enum([
    "RC",
    "CCTP",
    "CCAP",
    "ACTE_ENGAGEMENT",
    "DPGF",
    "BPU",
    "PLAN",
    "CADRE_MEMOIRE",
    "ANNEXE",
    "ADMINISTRATIF",
    "AUTRE",
    "UNKNOWN",
  ]),
  /** Justification courte, appuyee sur le contenu reellement lu. */
  reason: z.string().max(400),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export type DocumentClassification = z.infer<typeof DocumentClassificationSchema>;

export const CLASSIFY_SYSTEM = `ROLE
Tu es un charge d'etudes en entreprise de BTP. Tu identifies la nature des
pieces d'un dossier de consultation des entreprises (DCE).

OBJECTIF
Determiner de quelle piece il s'agit, a partir de son contenu reel.

NATURES POSSIBLES
- RC : reglement de consultation. Organise la consultation : criteres de
  jugement, contenu du pli, date limite, modalites de remise.
- CCTP : cahier des clauses techniques particulieres. Decrit les ouvrages a
  realiser et les prescriptions techniques.
- CCAP : cahier des clauses administratives particulieres. Delais, penalites,
  paiement, resiliation, assurances.
- ACTE_ENGAGEMENT : acte d'engagement, engagement chiffre du candidat.
- DPGF : decomposition du prix global et forfaitaire.
- BPU : bordereau des prix unitaires.
- PLAN : plan, coupe, facade, schema.
- CADRE_MEMOIRE : trame imposee du memoire technique a completer.
- ANNEXE : piece annexe rattachee a une autre.
- ADMINISTRATIF : attestation, assurance, formulaire DC1 / DC2 / DC4, extrait
  Kbis, attestation de vigilance.
- AUTRE : piece du DCE ne correspondant a aucune categorie ci-dessus.
- UNKNOWN : le contenu fourni ne permet pas de trancher.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu te fondes sur le contenu, pas sur le nom du fichier.
- Un document qui fixe des criteres de jugement et des modalites de remise est
  un RC, meme s'il contient des elements techniques.
- Si le contenu est trop court ou trop ambigu, tu reponds UNKNOWN avec une
  confiance LOW. Tu ne devines pas.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function classifyPrompt(input: {
  fileName: string;
  excerpt: string;
}): string {
  return `Nom du fichier : ${input.fileName}

Debut du contenu extrait :
"""
${input.excerpt}
"""

Determine la nature de cette piece.`;
}
