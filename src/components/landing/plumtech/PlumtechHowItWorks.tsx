const STEPS = [
  {
    n: "01",
    title: "Deposez le DCE",
    body: "RC, CCTP, CCAP, DPGF et annexes : MateriaBTP lit l\u2019ensemble du dossier de consultation.",
  },
  {
    n: "02",
    title: "Analysez et tranchez",
    body: "Go / No-Go argumente, criteres de jugement, delais et points de vigilance traces a la source.",
  },
  {
    n: "03",
    title: "Structurez la reponse",
    body: "Exigences extraites, plan de memoire aligne sur le RC, contenu fonde sur votre base entreprise.",
  },
  {
    n: "04",
    title: "Controlez et exportez",
    body: "Couverture des exigences, lacunes signalees, export Word / PDF pret pour la remise.",
  },
];

const TIMELINE = [
  { when: "Jour 1", label: "Base entreprise structuree" },
  { when: "Jour 2", label: "Premier dossier analyse" },
  { when: "Semaine 2", label: "Equipe autonome sur le workflow" },
];

export function PlumtechHowItWorks() {
  return (
    <section className="plumtech-section px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-meta uppercase text-primary">Comment ca marche</p>
          <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-[var(--mb-ink)]">
            Operationnel rapidement, pas en six mois
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--mb-muted)]">
            Pas de conduite du changement interminable : vous deposez le DCE, MateriaBTP
            structure la reponse, vos experts valident.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="plumtech-step-card rounded-[30px] bg-white p-5"
            >
              <p className="text-sm font-bold text-primary">{step.n}</p>
              <h3 className="mt-2 font-display text-lg font-bold text-[var(--mb-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mb-muted)]">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <ol className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-between">
          {TIMELINE.map((item) => (
            <li
              key={item.when}
              className="flex-1 rounded-[30px] border border-[rgba(var(--mb-primary-rgb),0.12)] bg-white px-4 py-3 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {item.when}
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--mb-ink-70)]">
                {item.label}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
