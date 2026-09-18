import { IndexGrid } from "@/components/marketing/page/IndexGrid";
import { resourcePages, resourceSlugs } from "@/lib/marketing/content/ressources";
import { pageMetadata } from "@/lib/marketing/content/metadata";

export const metadata = pageMetadata(
  "Ressources gratuites",
  "Modèles prêts à l'emploi pour vos appels d'offres : grille Go/No-Go, checklist candidature, trame de mémoire technique.",
);

export default function RessourcesIndexPage() {
  const items = resourceSlugs.map((slug) => {
    const page = resourcePages[slug];
    return { href: `/ressources/${slug}`, title: page.title, description: page.description, meta: page.format };
  });

  return (
    <IndexGrid
      eyebrow="Ressources gratuites"
      title="Des modèles prêts à l'emploi, sans attendre la démo"
      description="Grilles, checklists et trames pour structurer vos réponses aux appels d'offres dès aujourd'hui."
      items={items}
    />
  );
}
