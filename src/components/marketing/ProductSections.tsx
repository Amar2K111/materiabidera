import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";
import { LogoMark } from "@/components/marketing/ui/Logo";

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

function MockupShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-md select-none overflow-hidden rounded bg-white shadow-mockup ring-1 ring-midnight/10" aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-snow px-4 py-2">
        <span className="flex min-w-0 items-center gap-2">
          <LogoMark />
          <span className="truncate text-[11px] font-medium text-steel">{title}</span>
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-midnight text-[8px] font-bold text-white">
          SL
        </span>
      </div>
      {children}
    </div>
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
                Fini les Go décidés au feeling
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
                Déposez les pièces du DCE : RC, CCAP, CCTP. MateriaBTP en extrait les dates clés, les pénalités, les garanties et les points de vigilance, puis les confronte à vos critères de qualification, dans une Fiche Synthèse GoNoGo claire.
              </p>
              <ul className="mt-6 space-y-3">
                <CheckBullet>Synthèse du DCE en quelques minutes</CheckBullet>
                <CheckBullet>Points de vigilance signalés pièce par pièce</CheckBullet>
                <CheckBullet>Informations reconstituées par l&apos;IA tracées d&apos;une ⭐</CheckBullet>
              </ul>
              <ArrowLink href="/produit/analyse-go-no-go" className="mt-7 text-[15px] font-semibold text-iris hover:text-iris-hover">
                Explorer le module
              </ArrowLink>
            </Reveal>

            <Reveal delay={120} className="relative">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-iris/[0.07] blur-2xl" />
              <MockupShell title="Analyse du DCE › Rénovation éclairage public">
                <div className="flex">
                  <div className="hidden w-36 shrink-0 border-r border-line/70 bg-snow p-3 sm:block">
                    <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-pewter">Pièces du DCE</p>
                    <ul className="space-y-1 text-[11px] font-medium">
                      <li className="flex items-center justify-between rounded px-2 py-1.5 text-steel">
                        <span className="truncate">RC.pdf</span>
                        <CheckSmall />
                      </li>
                      <li className="flex items-center justify-between rounded bg-iris/10 px-2 py-1.5 text-iris">
                        <span className="truncate">CCAP.pdf</span>
                        <span className="shrink-0 text-[10px] font-bold text-amber-600">2</span>
                      </li>
                      <li className="flex items-center justify-between rounded px-2 py-1.5 text-steel">
                        <span className="truncate">CCTP.pdf</span>
                        <CheckSmall />
                      </li>
                    </ul>
                    <p className="mt-3 px-2 text-[10px] leading-relaxed text-pewter">14 pièces analysées · 42 exigences</p>
                  </div>
                  <div className="min-w-0 flex-1 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] font-bold text-midnight">CCAP</p>
                      <p className="shrink-0 text-[10px] font-medium text-pewter">2 points de vigilance</p>
                    </div>
                    <ul className="mt-3 divide-y divide-line/70">
                      <VigilanceItem text="Pénalités de retard : 1 000 € / jour calendaire, sans plafond" source="CCAP · art. 7.3" />
                      <VigilanceItem text="Délai de paiement dérogatoire au CCAG : porté à 60 jours" source="CCAP · art. 4.2" />
                      <li className="flex items-start gap-2.5 py-2.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        <span className="min-w-0">
                          <span className="block text-[11px] font-medium leading-snug text-midnight">Avance de 10 % versée sans garantie à première demande</span>
                          <span className="mt-0.5 block text-[10px] text-pewter">CCAP · art. 9.1 · voir la clause</span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </MockupShell>
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
                Le sommaire est construit sur les critères d&apos;évaluation de l&apos;acheteur, puis chaque section est rédigée à partir de votre base de connaissances. Vos experts affinent un premier jet solide au lieu de repartir de zéro.
              </p>
              <ul className="mt-6 space-y-3">
                <CheckBullet>Structuré sur les critères et leur pondération</CheckBullet>
                <CheckBullet>Rédigé avec vos méthodologies et vos références</CheckBullet>
                <CheckBullet>Sources vérifiables en un clic</CheckBullet>
              </ul>
              <ArrowLink href="/produit/memoire-technique" className="mt-7 text-[15px] font-semibold text-iris hover:text-iris-hover">
                Explorer le module
              </ArrowLink>
            </Reveal>

            <Reveal delay={120} className="relative lg:order-1">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-iris/[0.07] blur-2xl" />
              <MockupShell title="Mémoire technique › Rénovation éclairage public">
                <div className="flex">
                  <div className="hidden w-44 shrink-0 border-r border-line/70 bg-snow p-3 sm:block">
                    <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-pewter">Sommaire</p>
                    <ul className="space-y-1 text-[11px] font-medium">
                      <li className="flex items-center gap-2 rounded px-2 py-1.5 text-midnight/70">
                        <CheckSmall /> Compréhension du besoin
                      </li>
                      <li className="flex items-center gap-2 rounded bg-iris/10 px-2 py-1.5 text-iris">
                        <span className="flex h-3 w-3 shrink-0 items-center justify-center text-[9px]">2</span>
                        Méthodologie d&apos;exécution
                      </li>
                      <li className="flex items-center gap-2 rounded px-2 py-1.5 text-pewter">
                        <span className="flex h-3 w-3 shrink-0 items-center justify-center text-[9px] text-pewter/70">3</span>
                        Moyens humains
                      </li>
                    </ul>
                  </div>
                  <div className="min-w-0 flex-1 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] font-bold text-midnight">2. Méthodologie d&apos;exécution</p>
                      <p className="shrink-0 text-[10px] font-medium text-pewter">Valeur technique · 40 %</p>
                    </div>
                    <div className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-steel">
                      <p>
                        Nos équipes interviennent selon un phasage éprouvé sur 12 chantiers comparables : repérage des réseaux existants, travaux par tronçons pour maintenir l&apos;éclairage en service, puis récolement numérique
                        <sup className="font-semibold text-iris"> [1]</sup>.
                      </p>
                      <p className="rounded border-l-2 border-iris bg-iris/[0.05] px-3 py-2 text-midnight/80">
                        Un conducteur de travaux dédié assure un point d&apos;avancement hebdomadaire avec le maître d&apos;œuvre, appuyé par notre astreinte 24/7
                        <sup className="font-semibold text-iris"> [2]</sup>.
                      </p>
                    </div>
                    <p className="mt-3 text-[10px] font-medium text-pewter">Premier jet rédigé depuis votre base de connaissances · à relire</p>
                  </div>
                </div>
              </MockupShell>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-canvas">
        <Container className="py-14 lg:py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
              Votre matière et vos équipes, au même endroit
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
              Une réponse ne tient pas sur un document isolé : elle tient sur ce que vous avez déjà écrit, et sur les gens qui la construisent.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="flex h-full flex-col overflow-hidden rounded border border-line bg-white shadow-soft">
                <div className="card-wash h-[17rem] overflow-hidden border-b border-line px-7 pt-8">
                  <MockupShell title="Base de connaissances">
                    <div className="p-5">
                      <div className="flex items-center gap-2.5 rounded bg-snow px-3.5 py-2.5 ring-1 ring-line">
                        <SearchIcon />
                        <span className="truncate text-xs font-medium text-midnight/80">plan de prévention et astreinte 24/7</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-semibold text-midnight">Méthodologie chantier nocturne</p>
                        <p className="text-[10px] leading-relaxed text-steel">Phasage, astreinte, coordination réseaux…</p>
                      </div>
                      <p className="mt-3 text-[10px] font-medium text-pewter">2 résultats · la source exacte s&apos;ouvre en un clic</p>
                    </div>
                  </MockupShell>
                </div>
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Base de connaissances</p>
                  <h3 className="mt-3 text-balance text-[1.4rem] font-medium leading-[1.2] tracking-[-0.02em] text-midnight">
                    Vous l&apos;avez déjà écrit. MateriaBTP le retrouve.
                  </h3>
                  <p className="mt-4 text-pretty leading-relaxed text-steel">
                    Mémoires passés, méthodologies, certifications, questions-réponses : tout est centralisé, organisé et interrogeable. La recherche sémantique retrouve la bonne réponse, même formulée autrement.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {["Word, PDF, Excel", "Recherche sémantique", "Source exacte citée", "Enrichie à chaque réponse"].map((tag) => (
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
                  <MockupShell title="Pilotage des réponses">
                    <div className="p-5">
                      <div className="flex gap-5 border-b border-line text-[11px]">
                        <span className="-mb-px border-b-2 border-iris pb-2 font-semibold text-midnight">En cours 6</span>
                        <span className="pb-2 font-medium text-pewter">Déposées 12</span>
                        <span className="pb-2 font-medium text-pewter">Gagnées 7</span>
                      </div>
                      <div className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-[12px] font-semibold text-midnight">AO · Rénovation réseaux secs</p>
                          <p className="shrink-0 text-[11px] font-medium tabular-nums text-pewter">28 juil. · J-6</p>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
                            <div className="h-full w-[82%] rounded-full bg-iris" />
                          </div>
                          <span className="w-8 text-right text-[11px] font-bold tabular-nums text-midnight">82 %</span>
                        </div>
                      </div>
                      <p className="border-t border-line/70 pt-2.5 text-[10px] font-medium text-pewter">
                        Avancement suivi exigence par exigence, en temps réel
                      </p>
                    </div>
                  </MockupShell>
                </div>
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Collaboration & pilotage</p>
                  <h3 className="mt-3 text-balance text-[1.4rem] font-medium leading-[1.2] tracking-[-0.02em] text-midnight">
                    Chaque dossier déposé à l&apos;heure, complet, conforme
                  </h3>
                  <p className="mt-4 text-pretty leading-relaxed text-steel">
                    Assignez les sections à vos contributeurs internes ou externes, suivez l&apos;avancement par AO et par exigence en temps réel, et gardez le contrôle du calendrier jusqu&apos;au dépôt.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {["Assignation par section", "Accès limité pour les externes", "Dashboard AO, RFP, RFI", "Suivi exigence par exigence"].map((tag) => (
                      <li key={tag} className="rounded-full bg-snow px-3 py-1.5 text-[13px] font-medium text-steel ring-1 ring-line">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <ArrowLink href="/produit/collaboration" className="mt-auto pt-7 text-[15px] font-medium text-iris hover:text-iris-hover">
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

function CheckSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3 w-3 shrink-0 text-success">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function VigilanceItem({ text, source }: { text: string; source: string }) {
  return (
    <li className="flex items-start gap-2.5 py-2.5">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
      <span className="min-w-0">
        <span className="block text-[11px] font-medium leading-snug text-midnight">{text}</span>
        <span className="mt-0.5 block text-[10px] text-pewter">{source} · voir la clause</span>
      </span>
    </li>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 shrink-0 text-pewter">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}
