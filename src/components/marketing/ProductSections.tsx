import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";
import {
  AnalysisMockup,
  CompanySearchMockup,
  DashboardMockup,
  MemoryMockup,
} from "@/components/marketing/marketing-mockups";

function CheckBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] text-steel">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-periwinkle ring-1 ring-iris/20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3 w-3 text-iris">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      {children}
    </li>
  );
}

export function ProductSections() {
  return (
    <div id="produit">
      <section className="bg-canvas">
        <Container className="py-14 lg:py-20">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Analyse & Go/No-Go</p>
              <h2 className="mt-3 text-balance text-[1.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-midnight lg:text-[2.5rem]">
                Fini les Go sans avoir lu le CCAP
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
                Déposez RC, CCAP, CCTP. MateriaBTP en extrait les dates clés, les critères pondérés et les points de vigilance — pièce et page à l&apos;appui — puis confronte le dossier à votre base et à vos critères de qualification.
              </p>
              <ul className="mt-6 space-y-3">
                <CheckBullet>Synthèse du DCE en quelques minutes</CheckBullet>
                <CheckBullet>Pénalités, visites de site et dérogations signalées avec l&apos;extrait</CheckBullet>
                <CheckBullet>Ce qui manque dans les pièces est indiqué, jamais inventé</CheckBullet>
              </ul>
              <ArrowLink href="/produit/analyse-go-no-go" className="mt-7 text-[15px] font-semibold text-iris hover:text-iris-hover">
                Explorer le module
              </ArrowLink>
            </Reveal>

            <Reveal delay={120} className="relative">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-iris/[0.07] blur-2xl" />
              <AnalysisMockup />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="dotgrid bg-snow">
        <Container className="py-14 lg:py-20">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal className="lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Mémoire technique</p>
              <h2 className="mt-3 text-balance text-[1.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-midnight lg:text-[2.5rem]">
                La page blanche n&apos;existe plus
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
                Le sommaire suit les critères de jugement de l&apos;acheteur. Chaque chapitre est rédigé depuis votre base entreprise — méthodes, moyens, références — et chaque passage renvoie à sa source. Vos experts affinent un premier jet solide.
              </p>
              <ul className="mt-6 space-y-3">
                <CheckBullet>Sommaire calé sur la pondération du RC</CheckBullet>
                <CheckBullet>Rédaction depuis vos mémoires et fiches méthodes</CheckBullet>
                <CheckBullet>Source DCE ou base entreprise, vérifiable en un clic</CheckBullet>
              </ul>
              <ArrowLink href="/produit/memoire-technique" className="mt-7 text-[15px] font-semibold text-iris hover:text-iris-hover">
                Explorer le module
              </ArrowLink>
            </Reveal>

            <Reveal delay={120} className="relative lg:order-1">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-iris/[0.07] blur-2xl" />
              <MemoryMockup />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-canvas">
        <Container className="py-14 lg:py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
              Votre base entreprise et vos dossiers, centralisés
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
              Une réponse tient sur ce que vous avez déjà prouvé en chantier — et sur le suivi de chaque dossier jusqu&apos;au résultat.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="flex h-full flex-col overflow-hidden rounded border border-line bg-white shadow-soft">
                <div className="card-wash h-[17rem] overflow-hidden border-b border-line px-7 pt-8">
                  <CompanySearchMockup />
                </div>
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Base entreprise</p>
                  <h3 className="mt-3 text-balance text-[1.4rem] font-medium leading-[1.2] tracking-[-0.02em] text-midnight">
                    Vous l&apos;avez déjà écrit. MateriaBTP le retrouve.
                  </h3>
                  <p className="mt-4 text-pretty leading-relaxed text-steel">
                    Références chantiers, équipe, matériel, certifications, qualifications et méthodes : tout est centralisé et interrogeable. La recherche retrouve la bonne fiche, même si la formulation diffère.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {["PDF, Word, Excel", "Recherche sémantique", "Source exacte citée", "Chapitres réutilisables"].map((tag) => (
                      <li key={tag} className="rounded-full bg-snow px-3 py-1.5 text-[13px] font-medium text-steel ring-1 ring-line">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <ArrowLink href="/produit/base-de-connaissances" className="mt-auto pt-7 text-[15px] font-medium text-iris hover:text-iris-hover">
                    Explorer le module
                  </ArrowLink>
                </div>
              </article>
            </Reveal>

            <Reveal delay={110}>
              <article className="flex h-full flex-col overflow-hidden rounded border border-line bg-white shadow-soft">
                <div className="card-wash h-[17rem] overflow-hidden border-b border-line px-7 pt-8">
                  <DashboardMockup />
                </div>
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Suivi des dossiers</p>
                  <h3 className="mt-3 text-balance text-[1.4rem] font-medium leading-[1.2] tracking-[-0.02em] text-midnight">
                    Où en est chaque dossier, et ce qu&apos;il a donné
                  </h3>
                  <p className="mt-4 text-pretty leading-relaxed text-steel">
                    Chaque dossier avance par étapes — analyse, Go/No-Go, exigences, mémoire, contrôle, export — avec son échéance. Gagné ou perdu, le résultat alimente votre taux de réussite.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {["Étapes du workflow", "Échéances sous 7 jours", "Taux de réussite", "Contrôle avant dépôt"].map((tag) => (
                      <li key={tag} className="rounded-full bg-snow px-3 py-1.5 text-[13px] font-medium text-steel ring-1 ring-line">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <ArrowLink href="/logiciel-reponse-appels-offres" className="mt-auto pt-7 text-[15px] font-medium text-iris hover:text-iris-hover">
                    Explorer le module
                  </ArrowLink>
                </div>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}
