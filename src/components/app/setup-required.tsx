import { BrandLogo } from "@/components/brand/BrandLogo";
import { Notice } from "@/components/ui/notice";

/**
 * Ecran affiche lorsque la connexion a la base n'est pas configuree.
 * Section 37 : ne rien simuler, dire clairement ce qui manque.
 */
export function SetupRequired() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[620px] flex-col justify-center px-6 py-16">
      <BrandLogo height={24} />

      <h1 className="mt-8 text-[28px] font-extrabold tracking-[-0.035em]">
        Configuration requise
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-70">
        L&apos;application n&apos;est pas encore reliée à sa base de données.
        Tant que cette étape n&apos;est pas faite, aucune authentification ni
        aucun enregistrement n&apos;est possible.
      </p>

      <div className="mt-8">
        <Notice title="Étapes à réaliser">
          <ol className="mt-2 list-decimal space-y-1.5 pl-4">
            <li>
              Créer un projet Supabase, puis exécuter la migration
              <span className="font-semibold">
                {" "}
                supabase/migrations/0001_foundation.sql
              </span>
              .
            </li>
            <li>
              Copier le fichier <span className="font-semibold">.env.example</span>{" "}
              en <span className="font-semibold">.env.local</span>.
            </li>
            <li>
              Renseigner l&apos;URL du projet et la clé anonyme, puis relancer le
              serveur.
            </li>
          </ol>
        </Notice>
      </div>

      <p className="mt-6 text-[13px] text-ink-42">
        La clé de service ne doit jamais porter le préfixe NEXT_PUBLIC_ : elle
        contourne les règles de sécurité et doit rester côté serveur.
      </p>
    </main>
  );
}
