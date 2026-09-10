const CARDS = [
  {
    icon: <path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z" />,
    title: "Chiffrement en transit et au repos",
    text: "Les documents déposés sont chiffrés pendant le transfert et pendant leur stockage.",
  },
  {
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M4 10h16" />
      </>
    ),
    title: "Isolation par entreprise",
    text: "Votre base entreprise et vos dossiers sont cloisonnés. Ils ne sont jamais partagés avec une autre entreprise utilisatrice.",
  },
  {
    icon: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    title: "Contrôle des accès",
    text: "Chaque dossier est ouvert aux personnes que vous désignez, avec des droits par compte.",
  },
  {
    icon: (
      <>
        <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
      </>
    ),
    title: "Suppression et conservation",
    text: "Vous pouvez supprimer un dossier et ses documents. La politique de conservation vous est communiquée par écrit.",
  },
  {
    icon: (
      <>
        <path d="M6 4h12v16H6z" />
        <path d="M9 9h6M9 13h6" />
      </>
    ),
    title: "Pas d’entraînement sur vos documents",
    text: "Vos pièces de marché et votre base entreprise ne servent qu’à vos propres réponses.",
  },
  {
    icon: (
      <>
        <path d="M12 4v16M4 12h16" />
      </>
    ),
    title: "Vos questions, nos réponses",
    text: "Hébergement, sous-traitants techniques, réversibilité : nous répondons précisément et par écrit lors de la démonstration.",
  },
] as const;

export function SecuritySection() {
  return (
    <section className="sec sec--paper sec--line" id="securite">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Sécurité et confidentialité</p>
          <h2 className="h2">Vos appels d’offres restent vos données.</h2>
          <p className="lede">
            Un DCE en cours, un chiffrage, un mémoire technique : ce sont des
            documents sensibles. Nous n’affichons ici que ce qui est réellement
            en place.
          </p>
        </div>

        <div className="grid g3 rv-group">
          {CARDS.map((card) => (
            <article className="card rv-item" key={card.title}>
              <svg className="card-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
                {card.icon}
              </svg>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>

        <p className="note rv" style={{ marginTop: 28, maxWidth: "74ch" }}>
          Aucune certification n’est affichée tant qu’elle n’est pas obtenue.
        </p>
      </div>
    </section>
  );
}
