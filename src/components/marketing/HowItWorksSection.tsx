import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";

const steps = [
  {
    num: "01",
    title: "Déposez vos documents",
    desc: "Mémoires passés, méthodologies, certifications, politiques RSE, dans tous les formats, sans préparation préalable.",
  },
  {
    num: "02",
    title: "Nous structurons votre base",
    desc: "Notre équipe organise votre base de connaissances avec vous. Pas de migration complexe, pas de projet IT.",
  },
  {
    num: "03",
    title: "L'IA analyse et rédige",
    desc: "Les agents lisent le DCE, construisent le sommaire sur les critères de l'acheteur et rédigent un premier jet sourcé.",
  },
  {
    num: "04",
    title: "Vos experts affinent",
    desc: "Relecture, ajustement au contexte, variantes : vos équipes consacrent leur temps à ce qui fait la différence.",
  },
];

const timeline = [
  { when: "Jour 1", label: "Votre base de connaissances est structurée" },
  { when: "Jour 2", label: "Votre première réponse est générée" },
  { when: "Semaine 2", label: "Vos équipes sont autonomes" },
];

export function HowItWorksSection() {
  return (
    <section className="bg-canvas" id="comment-ca-marche">
      <Container className="py-12 lg:py-16">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Comment ça marche</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
            Opérationnel en 48 heures, pas en six mois
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            Pas de longue conduite du changement : vous déposez votre matière, on structure, et votre première réponse sort dès le deuxième jour.
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
