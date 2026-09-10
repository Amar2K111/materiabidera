const PILLARS = [
  {
    title: "Les pièces du marché",
    text: "DCE, RC, CCTP, CCAP, annexes et critères de jugement sont reconnus pour ce qu’ils sont, avec le rôle que chacun joue dans la consultation.",
  },
  {
    title: "La structure du mémoire",
    text: "Méthodologie, organisation de chantier, moyens humains et matériels, planning, QSE, environnement, références : le plan attendu par l’acheteur.",
  },
  {
    title: "Les contraintes d’exécution",
    text: "Phasage, site occupé, interfaces entre lots, accès et nuisances : les sujets sur lesquels une réponse générique se fait sanctionner.",
  },
] as const;

export function SpecializationSection() {
  return (
    <section className="sec sec--paper sec--line">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Spécialisation</p>
          <h2 className="h2">Pensé pour les entreprises du BTP.</h2>
          <p className="lede">
            MateriaBTP connaît le vocabulaire et la structure d’une réponse à un
            marché de travaux. Ce n’est pas un outil générique auquel on aurait
            ajouté un habillage bâtiment.
          </p>
        </div>

        <div className="grid g3 rv-group">
          {PILLARS.map((pillar) => (
            <article className="pillar rv-item" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>

        <p className="note rv" style={{ marginTop: 28, maxWidth: "74ch" }}>
          MateriaBTP ne prétend pas connaître automatiquement tous les marchés ni
          toutes les règles juridiques applicables. Il travaille sur les
          documents que vous lui donnez.
        </p>
      </div>
    </section>
  );
}
