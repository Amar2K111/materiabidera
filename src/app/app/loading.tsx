import { Skeleton, SkeletonCard, SkeletonScreen } from "@/components/ui/skeleton";

/** Attente des pages de l'espace de travail (tableau de bord, listes, reglages). */
export default function AppLoading() {
  return (
    <SkeletonScreen>
      <Skeleton className="h-6 w-64" />
      <Skeleton className="mt-3 h-3 w-full max-w-[52ch]" />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
      </div>

      <SkeletonCard lines={7} className="mt-4" />
    </SkeletonScreen>
  );
}
