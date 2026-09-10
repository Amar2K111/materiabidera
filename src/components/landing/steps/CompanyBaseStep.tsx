import { MockupFrame } from "../MockupFrame";

const CARDS = [
  {
    title: "Présentation et références",
    text: "Présentation de l’entreprise, savoir-faire et chantiers similaires déjà réalisés.",
    icon: (
      <svg className="card-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    title: "Moyens humains",
    text: "Collaborateurs, CV, qualifications et encadrement mobilisable sur l’opération.",
    icon: (
      <svg className="card-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        <path d="M17 11h4M17 15h4" />
      </svg>
    ),
  },
  {
    title: "Moyens matériels",
    text: "Équipements, matériel et capacités de production disponibles sur la période.",
    icon: (
      <svg className="card-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
        <rect x="3" y="9" width="13" height="8" rx="1.5" />
        <path d="M16 12h3l2 3v2h-5z" />
        <circle cx="7" cy="18.5" r="1.6" />
        <circle cx="18" cy="18.5" r="1.6" />
      </svg>
    ),
  },
  {
    title: "Méthodes, QSE et certifications",
    text: "Procédures, modes opératoires, documents QSE, environnement et certifications.",
    icon: (
      <svg className="card-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
        <path d="M6 4h12v16H6z" />
        <path d="M9 9h6M9 13h6M9 17h3" />
      </svg>
    ),
  },
] as const;

/** Étape 4, base entreprise. */
export function CompanyBaseStep() {
  return (
    <section className="sec sec--paper sec--line">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Étape 4, base entreprise</p>
          <h2 className="h2">Votre entreprise ne repart plus de zéro.</h2>
          <p className="lede">
            Centralisez ce que vous réutilisez à chaque réponse. Plus votre
            base entreprise est structurée, plus MateriaBTP peut produire des
            réponses spécifiques et pertinentes.
          </p>
        </div>

        <div className="grid g4 rv" style={{ marginTop: 48 }}>
          {CARDS.map((c) => (
            <article className="card" key={c.title}>
              {c.icon}
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>

        <figure className="rv" style={{ marginTop: 36 }}>
          <MockupFrame
            flat
            ariaLabel="Base entreprise dans MateriaBTP : documents internes rattachés à une exigence du marché avec leur source."
            crumb={<b>Base entreprise</b>}
            right={<span className="tag">Rattachée au chapitre 3</span>}
          >
            <div className="ui-main">
              <div className="search">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.6-3.6" />
                </svg>
                Exigence : méthodologie chantier en site occupé
              </div>
              <div className="panels panels--2" style={{ marginTop: 12 }}>
                <div className="panel">
                  <div className="panel-h">
                    Éléments disponibles <span>Utilisables</span>
                  </div>
                  <div className="panel-b">
                    <div className="file">
                      <span className="file-ic">REF</span>
                      <span className="file-n">
                        Référence, rénovation collège
                      </span>
                      <span className="file-m">2 p.</span>
                    </div>
                    <div className="file">
                      <span className="file-ic">PRO</span>
                      <span className="file-n">
                        Procédure, travaux en site occupé
                      </span>
                      <span className="file-m">interne</span>
                    </div>
                    <div className="file">
                      <span className="file-ic">CV</span>
                      <span className="file-n">CV, conducteur de travaux</span>
                      <span className="file-m">p.2</span>
                    </div>
                    <div className="file">
                      <span className="file-ic">QSE</span>
                      <span className="file-n">
                        Plan de gestion des déchets
                      </span>
                      <span className="file-m">modèle</span>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-h">
                    Éléments absents <span>Signalés</span>
                  </div>
                  <div className="panel-b">
                    <div className="flag risk">
                      <b>Attestation d’assurance décennale</b>
                      <span>
                        Demandée à l’équipe, aucune rédaction sur ce point
                      </span>
                    </div>
                    <div className="flag warn">
                      <b>Certification demandée en isolation</b>
                      <span>Absente de la base entreprise</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MockupFrame>
        </figure>

        <p className="pull rv" style={{ marginTop: 36 }}>
          Quand une information n’existe pas dans votre base, MateriaBTP vous la
          demande au lieu de l’inventer.
        </p>
      </div>
    </section>
  );
}
