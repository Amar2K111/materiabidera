import { cn } from "@/lib/utils/cn";

/**
 * Bloc d'attente (section 26).
 *
 * Il reprend la forme du contenu qui va s'afficher, pour que la page ne saute
 * pas au moment ou les donnees arrivent. Purement decoratif : masque aux
 * lecteurs d'ecran, qui recoivent l'etat via aria-busy sur le conteneur.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("app-ui__skel", className)} aria-hidden />;
}

/** Plusieurs lignes de texte, la derniere plus courte comme un vrai paragraphe. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <span className={cn("block space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3 w-full", i === lines - 1 && "w-3/5")}
        />
      ))}
    </span>
  );
}

/** Carte d'attente, au gabarit des cartes du produit. */
export function SkeletonCard({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[10px] border border-line bg-white p-5", className)}>
      <Skeleton className="h-3.5 w-40" />
      <SkeletonText lines={lines} className="mt-4" />
    </div>
  );
}

/**
 * Enveloppe des ecrans d'attente : annonce le chargement une seule fois aux
 * lecteurs d'ecran, sans lire chaque bloc gris.
 */
export function SkeletonScreen({
  label = "Chargement en cours",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div aria-busy="true" aria-live="polite" className="app-ui__skel-screen">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
