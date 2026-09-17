import Link from "next/link";

/** Adresse inconnue. Rendue hors de l'espace de travail : on y ramene. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="text-[12px] font-semibold tracking-[0.12em] text-ink-58 uppercase">
        Page introuvable
      </p>
      <h1 className="mt-3 text-[26px] font-extrabold tracking-[-0.03em]">
        Cette adresse ne correspond à aucune page
      </h1>
      <p className="mt-3 max-w-[54ch] text-[14px] leading-relaxed text-ink-58">
        Le lien est peut-être incomplet, ou la page a changé d&rsquo;adresse.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/app"
          className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Aller à mon espace de travail
        </Link>
        <Link
          href="/"
          className="text-[13px] font-semibold text-ink-70 underline-offset-4 hover:underline"
        >
          Retour à l&rsquo;accueil
        </Link>
      </div>
    </main>
  );
}
