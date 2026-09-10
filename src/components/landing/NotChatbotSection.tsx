const PIPE = [
  "DCE",
  "Analyse",
  "Exigences",
  "Connaissances entreprise",
  "Stratégie",
  "Mémoire",
  "Contrôle",
  "Word / PDF",
] as const;

const GENERALIST_POINTS = [
  "Vous reconstruisez le contexte à chaque échange",
  "Les pièces du marché restent dispersées hors de l’outil",
  "Aucun suivi de la couverture des exigences",
  "Le texte produit ne cite pas ses sources",
  "Rien ne vérifie la réponse avant le dépôt",
] as const;

const MateriaBTP_POINTS = [
  "Le DCE complet est analysé et structuré",
  "Les exigences sont reliées à leur page d’origine",
  "Votre base entreprise alimente la rédaction",
  "Les critères de jugement deviennent des axes de réponse",
  "La couverture est contrôlée, puis exportée en Word ou PDF",
] as const;

function ArrowIcon() {
  return (
    <svg className="arw" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function PipeStep({
  children,
  isLast,
  showArrowBefore,
}: {
  children: React.ReactNode;
  isLast: boolean;
  showArrowBefore: boolean;
}) {
  return (
    <>
      {showArrowBefore ? <ArrowIcon /> : null}
      <li className={isLast ? "on" : undefined}>{children}</li>
    </>
  );
}

/** MateriaBTP n'est pas un chatbot : la chaîne de traitement, puis la comparaison. */
export function NotChatbotSection() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">La différence</p>
          <h2 className="h2">
            MateriaBTP n’est pas un chatbot qui écrit du texte.
          </h2>
          <p className="lede">
            MateriaBTP structure votre réponse autour du DCE, des exigences du
            marché et des connaissances réelles de votre entreprise. C’est
            un workflow complet, pas une conversation.
          </p>
        </div>

        {/* La fleche reste un element libre entre deux <li>, comme dans la page
           source : cela lui evite le style de pastille reserve aux etapes,
           tout en profitant du meme espacement flex. */}
        <ul className="pipe rv" aria-label="Enchaînement du workflow MateriaBTP">
          {PIPE.map((step, i) => (
            <PipeStep key={step} isLast={i === PIPE.length - 1} showArrowBefore={i > 0}>
              {step}
            </PipeStep>
          ))}
        </ul>

        <div className="vs rv-group">
          <div className="vs-col rv-item">
            <div className="vs-h">
              <b>Un assistant généraliste</b>
              <span>Une conversation</span>
            </div>
            <ul className="vs-l">
              {GENERALIST_POINTS.map((p) => (
                <li key={p}>
                  <svg className="m" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="vs-col on rv-item">
            <div className="vs-h">
              <b>MateriaBTP</b>
              <span>Un workflow de réponse aux appels d’offres</span>
            </div>
            <ul className="vs-l">
              {MateriaBTP_POINTS.map((p) => (
                <li key={p}>
                  <svg className="p" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    <path d="m5 12 5 5L19 7" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
