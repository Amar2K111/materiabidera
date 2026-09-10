const VALUES = [
  {
    title: "Gagnez du temps",
    text: "Réduisez le temps consacré à la lecture du dossier, à la structuration de la réponse et à la rédaction des chapitres.",
  },
  {
    title: "Répondez plus précisément",
    text: "Construisez une réponse directement liée aux exigences et aux critères de jugement du marché, pas à un modèle réutilisé.",
  },
  {
    title: "Sécurisez votre réponse",
    text: "Identifiez les oublis, les éléments partiels et les informations à vérifier avant la remise, pendant qu’il reste du temps pour agir.",
  },
] as const;

export function ValueSection() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Ce que vous y gagnez</p>
          <h2 className="h2">Trois bénéfices, pas seulement du temps.</h2>
        </div>

        <div className="grid g3 rv-group">
          {VALUES.map((val) => (
            <article className="val rv-item" key={val.title}>
              <h3>{val.title}</h3>
              <p>{val.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
