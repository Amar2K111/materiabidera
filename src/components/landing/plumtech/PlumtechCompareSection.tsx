const ROWS = [
  {
    topic: "Sources et tracabilite",
    generic: "Plausible, mais inv\u00e9rifiable \u2014 a vous de tout relire",
    materia: "Chaque passage reli\u00e9 au DCE ou a votre base entreprise",
  },
  {
    topic: "Savoir-faire BTP",
    generic: "Ne connait ni vos references chantier ni vos moyens reels",
    materia: "Mobilise references, methodes, certifications et CV de votre base",
  },
  {
    topic: "Conformite au DCE",
    generic: "Ignore le RC, la ponderation et le cadre du memoire",
    materia: "Plan aligne sur les criteres, suivi exigence par exigence",
  },
  {
    topic: "Pi\u00e8ges contractuels",
    generic: "Ne detecte pas les clauses sensibles du CCAP",
    materia: "Delais, penalites et points de vigilance extraits du DCE",
  },
  {
    topic: "Confidentialite",
    generic: "Variable selon l\u2019outil et le parametrage",
    materia: "Hebergement UE, donnees isolees, sans entrainement sur vos dossiers",
  },
  {
    topic: "Workflow equipe AO",
    generic: "Un chat individuel, pas un process dossier",
    materia: "DCE \u2192 Go/No-Go \u2192 Exigences \u2192 Memoire \u2192 Export",
  },
];

export function PlumtechCompareSection() {
  return (
    <section className="plumtech-section px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-meta uppercase text-primary">
            La question qu&apos;on nous pose toujours
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-[var(--mb-ink)]">
            Et pourquoi pas ChatGPT ?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--mb-muted)]">
            Un LLM generaliste est un assistant polyvalent. MateriaBTP est l&apos;outil
            du metier pour les appels d&apos;offres BTP.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[30px] bg-white plumtech-compare-table">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b px-4 py-3 font-semibold text-[var(--mb-muted)]">
                  {" "}
                </th>
                <th className="border-b px-4 py-3 font-semibold text-[var(--mb-muted)]">
                  LLM generaliste
                </th>
                <th className="border-b px-4 py-3 font-display font-bold">
                  MateriaBTP
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.topic}>
                  <th className="border-b px-4 py-3 align-top font-semibold text-[var(--mb-ink)]">
                    {row.topic}
                  </th>
                  <td className="border-b px-4 py-3 align-top text-[var(--mb-muted)]">
                    {row.generic}
                  </td>
                  <td className="border-b px-4 py-3 align-top font-medium">
                    {row.materia}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--mb-muted)]">
          Pour un email, un LLM suffit. Pour un marche BTP, il y a l&apos;outil du
          metier.{" "}
          <button type="button" className="btn-calendly font-semibold text-primary">
            {"Reservez une demo \u2192"}
          </button>
        </p>
      </div>
    </section>
  );
}
