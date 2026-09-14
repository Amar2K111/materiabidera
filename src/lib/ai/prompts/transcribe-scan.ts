import { z } from "zod";

export const ScanTranscriptionSchema = z.object({
  pages: z.array(
    z.object({
      /** Numero de la page dans le PDF, a partir de 1. */
      page: z.number().int().min(1),
      /** Texte lisible de la page, dans l'ordre de lecture. Vide si illisible. */
      text: z.string(),
    }),
  ),
});

export type ScanTranscription = z.infer<typeof ScanTranscriptionSchema>;

export const TRANSCRIBE_SYSTEM = `ROLE
Tu transcris des documents scannes de marches publics et prives du BTP :
reglements de consultation, CCTP, CCAP, actes d'engagement, annexes.

OBJECTIF
Restituer fidelement le texte de chaque page, pour qu'il puisse etre analyse et
cite avec son numero de page.

REGLES ABSOLUES
1. Tu recopies le texte tel qu'il figure sur la page. Tu ne resumes pas, tu ne
   reformules pas, tu ne corriges pas le fond.
2. Tu n'ajoutes aucune information absente de la page. Un passage illisible est
   remplace par "[illisible]", jamais par une supposition.
3. Chaque page du PDF donne une entree, avec son numero reel. Une page blanche
   ou totalement illisible donne un texte vide.
4. Les tableaux sont restitues ligne par ligne, cellules separees par " | ".
5. Tu conserves les numeros d'articles, montants, delais et pourcentages
   exactement comme ils sont ecrits.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function transcribePrompt(input: { fileName: string; pageCount: number }) {
  return `Document : ${input.fileName}
Nombre de pages : ${input.pageCount}

Transcris le texte de chacune des ${input.pageCount} pages du document joint.`;
}
