import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";

const steps = [
  {
    num: "01",
    title: "Renseignez votre base",
    desc: "Références chantiers, équipe, matériel, certifications, qualifications, méthodes. Vos anciens mémoires deviennent une matière réutilisable et citable.",
  },
  {
    num: "02",
    title: "Déposez le DCE",
    desc: "RC, CCAP, CCTP, annexes : exigences, critères pondérés et points de vigilance relevés avec pièce et page.",
  },
  {
    num: "03",
    title: "Tranchez le Go/No-Go",
    desc: "Huit facteurs notés, critères de qualification vérifiés, sources à l'appui. MateriaBTP recommande ; vous décidez.",
  },
  {
    num: "04",
    title: "Rédigez, contrôlez, exportez",
    desc: "Sommaire calé sur le RC, rédaction depuis votre base, contrôle qualité, export Word ou PDF — prêt pour la relecture finale.",
  },
];

const timeline = [
  { when: "Jour 1", label: "Votre base entreprise est renseignée — références, moyens, qualifications" },
  { when: "Jour 2", label: "Votre premier DCE est analysé et votre mémoire amorcé" },
  { when: "Semaine 2", label: "Vos équipes sont autonomes sur le workflow complet" },
];

export function HowItWorksSection() {
  return (
    <section className="bg-canvas" id="comment-ca-marche">
      <Container className="py-12 lg:py-16">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Comment ça marche</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
            Opérationnel dès le premier dossier, pas après six mois
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            Pas de migration complexe : vous renseignez votre base entreprise, vous déposez le DCE, et la réponse suit le même chemin — analyse, décision, mémoire, contrôle, export.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.num} delay={index * 90}>
              <div className="lift h-full rounded border border-line bg-white p-6 shadow-soft transition-colors hover:border-iris/30">
                <span className="text-3xl font-medium tabular-nums text-iris">{step.num}</span>
                <h3 className="mt-4 text-lg font-medium text-midnight">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-steel">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150} className="mt-12">
          <div className="rounded border border-line bg-snow p-8 lg:p-10">
            <ol className="grid gap-8 sm:grid-cols-3">
              {timeline.map((item, index) => (
                <li key={item.when} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 shrink-0 rounded-full bg-iris ring-4 ring-iris/15" />
                    {index < timeline.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="hidden h-px flex-1 bg-gradient-to-r from-iris/40 to-iris/10 sm:block"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-iris">{item.when}</p>
                  <p className="mt-1.5 text-[15px] font-medium leading-snug text-midnight">{item.label}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
