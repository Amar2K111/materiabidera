const ROWS = [
  {
    exigence: "Assurance décennale",
    source: "RC.pdf p.12",
    tag: "risk",
    label: "À vérifier",
  },
  {
    exigence: "Visite obligatoire",
    source: "RC.pdf p.18",
    tag: "ok",
    label: "Couvert",
  },
  {
    exigence: "Méthodologie chantier",
    source: "CCTP.pdf p.42",
    tag: "",
    label: "À traiter",
  },
  {
    exigence: "Gestion des interfaces",
    source: "CCTP.pdf p.57",
    tag: "warn",
    label: "Partiel",
  },
  {
    exigence: "Critère environnemental",
    source: "RC.pdf p.8",
    tag: "warn",
    label: "Partiel",
  },
] as const;

/** Étape 3, exigences et traçabilité. */
export function RequirementsStep() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Étape 3, exigences</p>
          <h2 className="h2">Chaque réponse doit pouvoir être vérifiée.</h2>
          <p className="lede">
            Chaque exigence est reliée au document et à la page dont elle
            provient, avec son état de couverture. Ne laissez plus une
            exigence oubliée fragiliser votre réponse.
          </p>
        </div>

        <table className="matrix rv">
          <caption>
            Extrait, réhabilitation d’un groupe scolaire, lot 3
          </caption>
          <thead>
            <tr>
              <th scope="col">Exigence</th>
              <th scope="col">Source</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.exigence}>
                <td data-label="Exigence">{r.exigence}</td>
                <td data-label="Source" className="src">
                  {r.source}
                </td>
                <td data-label="Statut">
                  <span className={r.tag ? `tag ${r.tag}` : "tag"}>
                    <i />
                    {r.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="pull rv" style={{ marginTop: 36 }}>
          Vous pouvez toujours remonter à la page d’origine d’une
          information.
        </p>
      </div>
    </section>
  );
}
