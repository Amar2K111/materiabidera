import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/marketing/config/contact";

const faqs = [
  {
    q: "Combien de temps faut-il pour démarrer ?",
    a: "Le temps de renseigner l'essentiel de votre base : quelques références chantiers, votre équipe, vos qualifications, ou vos anciens mémoires. L'analyse d'un DCE prend ensuite quelques minutes. Une base incomplète fonctionne — l'outil signale simplement ce qui manque.",
  },
  {
    q: "MateriaBTP remplace-t-il mes équipes ?",
    a: "Non, et ce n'est pas l'objectif. MateriaBTP élimine la page blanche, la recherche d'information et les tâches répétitives. Vos experts gardent la stratégie de réponse, l'ajustement au contexte et la relecture critique.",
  },
  {
    q: "Quels types de consultations couvrez-vous ?",
    a: "Les appels d'offres de travaux, publics ou privés, dès lors que vous disposez des pièces (règlement de consultation, CCAP, CCTP, annexes). Le mémoire s'exporte en Word et en PDF. Les questionnaires de type RFP ou DDQ ne sont pas traités.",
  },
  {
    q: "Comment l'IA connaît-elle notre entreprise ?",
    a: "Par votre base entreprise : références, équipe, matériel, certifications, qualifications, méthodes et anciens mémoires. L'outil ne vous attribue rien qui n'y figure pas, et chaque chapitre affiche ses sources.",
  },
  {
    q: "Où vont mes documents ?",
    a: "Ils sont stockés chez notre hébergeur de données (Supabase), isolés par entreprise, et transmis au fournisseur d'IA du service pour être analysés. MateriaBTP n'entraîne aucun modèle dessus. Le détail est sur la page sécurité.",
  },
  {
    q: "Faites-vous de la veille des appels d'offres ?",
    a: "Non. MateriaBTP intervient une fois la consultation repérée : vous déposez le DCE, puis l'outil vous aide à décider et à répondre. Il se combine avec l'outil de veille que vous utilisez déjà.",
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
