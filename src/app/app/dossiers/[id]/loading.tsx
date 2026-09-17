import { Skeleton, SkeletonCard, SkeletonScreen } from "@/components/ui/skeleton";

/**
 * Attente d'une etape du dossier.
 *
 * L'en-tete du dossier et la colonne vertebrale restent affiches et cliquables :
 * seul le contenu de l'etape est remplace. L'utilisateur voit immediatement que
 * son clic a ete pris en compte, et peut changer d'avis sans attendre.
 */
export default function ProjectStepLoading() {
  return (
    <SkeletonScreen label="Chargement de l'étape">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="mt-3 h-3 w-full max-w-[46ch]" />
        </div>
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>

      <SkeletonCard lines={6} className="mt-4" />
    </SkeletonScreen>
  );
}
