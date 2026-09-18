import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/marketing/config/contact";

const faqs = [
  {
    q: "Combien de temps faut-il pour être opérationnel ?",
    a: "48 heures. Jour 1 : vous déposez vos documents et notre équipe structure votre base de connaissances. Jour 2 : vous générez votre première réponse. Dès la deuxième semaine, vos équipes sont autonomes, sans migration complexe ni projet IT.",
  },
  {
    q: "MateriaBTP remplace-t-il mes équipes ?",
    a: "Non, et ce n'est pas l'objectif. MateriaBTP élimine la page blanche, la recherche d'informations et les tâches répétitives. Vos experts gardent la main sur ce qui fait gagner : la stratégie de réponse, l'ajustement au contexte et la relecture critique.",
  },
  {
    q: "Quels types de consultations couvrez-vous ?",
    a: "Les appels d'offres publics et privés, les RFP, les RFI, les DDQ (questionnaires de due diligence) et les questionnaires de sécurité : au format mémoire technique Word/PDF comme au format questionnaire Excel.",
  },
  {
    q: "Comment l'IA connaît-elle notre entreprise ?",
    a: "Tout part de votre base de connaissances : vos mémoires passés, méthodologies, références, certifications et réponses antérieures. La rédaction s'appuie exclusivement sur cette matière, avec les sources citées, jamais sur du contenu générique.",
  },
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Vos données sont hébergées en France sur des serveurs qualifiés SecNumCloud, 100 % conformes RGPD et souverains. Elles ne servent jamais à entraîner des modèles tiers.",
  },
  {
    q: "Êtes-vous compatibles avec nos outils de veille ?",
    a: "Oui. MateriaBTP intervient en aval de la veille : dès que votre outil de veille détecte une consultation, vous déposez le DCE chez nous pour l'analyse Go/No-Go puis la rédaction. Les deux sont complémentaires.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-snow">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">FAQ</p>
            <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-steel">
              Une autre question ? Écrivez-nous, on répond vite :{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-iris hover:text-iris-hover">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="faq-item group rounded border border-line bg-white px-5 transition-colors hover:border-iris/30">
                  <summary className="flex items-center justify-between gap-4 py-4 text-left text-midnight transition-colors hover:text-iris">
                    <h3 className="text-[17px] font-semibold text-inherit">{faq.q}</h3>
                    <span
                      className="faq-chevron flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-snow text-iris ring-1 ring-line"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-5 pr-10 text-[15px] leading-relaxed text-steel">{faq.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
