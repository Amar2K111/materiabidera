import { CalendlyDemoLink } from "./CalendlyDemoLink";
import { HeroVisual } from "./HeroVisual";
import { MockupFrame } from "./MockupFrame";

/**
 * Section d'ouverture, avec la maquette du tableau de bord MateriaBTP.
 *
 * La maquette reste une representation marketing statique : uniquement des
 * ecrans reellement presents dans le logiciel, jamais les donnees d'un
 * utilisateur reel (section 8 du cahier des charges).
 */
export function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-label">
            <i aria-hidden="true" />
            Conçu pour les entreprises du BTP qui répondent aux appels
            d’offres.
          </span>

          <h1>Transformez vos appels d’offres en réponses gagnantes</h1>

          <p className="hero-lead">
            MateriaBTP analyse vos DCE, valorise votre savoir-faire et vous
            accompagne jusqu’au mémoire technique vérifié. Une seule plateforme,
            un processus maîtrisé.
          </p>

          <ul className="hero-checks">
            <li>Analyse de DCE</li>
            <li>Exigences tracées</li>
            <li>Mémoire technique</li>
            <li>Export Word et PDF</li>
          </ul>

          <div className="btn-row">
            <CalendlyDemoLink className="btn btn--primary">
              Réserver une démo
            </CalendlyDemoLink>
            <a className="btn btn--ghost" href="#workflow">
              Voir comment ça marche
            </a>
          </div>
        </div>

        <HeroVisual>
          <MockupFrame
            ariaLabel="Tableau de bord MateriaBTP d’un appel d’offres BTP : 24 documents, 487 pages, 86 exigences, 12 points de vigilance, 18 jours restants, score Go/No-Go de 82 sur 100 avec recommandation GO, progression du mémoire technique, alertes et sources documentaires."
            crumb={
              <>
                Dossiers / <b>Réhabilitation d’un groupe scolaire</b>
              </>
            }
            right={
              <>
                <span className="tag">Lot 3, enveloppe</span>
                <span className="tag blue">
                  <i />
                  Analyse terminée
                </span>
              </>
            }
            foot={
              <>
                <p>
                  Sources : CCTP.pdf, RC.pdf, base entreprise, références
                  chantier, CV, certifications
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="ui-btn ui-btn--ghost">Exporter PDF</span>
                  <span className="ui-btn">Exporter Word</span>
                </div>
              </>
            }
          >
            <div className="ui-body">
              <aside className="ui-side">
                <p className="ui-side-t">Dossier</p>
                <ul className="ui-nav">
                  <li className="on">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <rect x="4" y="3" width="16" height="18" rx="2" />
                      <path d="M8 8h8M8 12h8M8 16h5" />
                    </svg>
                    Vue d’ensemble
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5" />
                    </svg>
                    Documents
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="8" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Go / No-Go
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M4 6h16M4 12h16M4 18h10" />
                    </svg>
                    Exigences
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M4 5h16v14H4z" />
                      <path d="M9 5v14" />
                    </svg>
                    Base entreprise
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M4 19V9M10 19V4M16 19v-7M22 19H2" />
                    </svg>
                    Stratégie
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M5 4h14v16l-7-3-7 3z" />
                    </svg>
                    Mémoire technique
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z" />
                    </svg>
                    Contrôle
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M5 12h4l2 5 3-11 2 6h3" />
                    </svg>
                    Checklist
                  </li>
                </ul>
              </aside>

              <div className="ui-main">
                <div className="metrics">
                  <div className="metric">
                    <b>24</b>
                    <span>documents</span>
                  </div>
                  <div className="metric">
                    <b>487</b>
                    <span>pages</span>
                  </div>
                  <div className="metric">
                    <b>86</b>
                    <span>exigences</span>
                  </div>
                  <div className="metric is-warn">
                    <b>12</b>
                    <span>points de vigilance</span>
                  </div>
                  <div className="metric">
                    <b>18 j</b>
                    <span>restants</span>
                  </div>
                  <div className="metric is-blue">
                    <b>82</b>
                    <span>score Go / No-Go</span>
                  </div>
                </div>

                <div className="panels panels--3">
                  <div className="panel">
                    <div className="panel-h">
                      Go / No-Go <span>Recommandation</span>
                    </div>
                    <div className="panel-b">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          margin: "4px 0 12px",
                        }}
                      >
                        <span className="score ok">
                          <b>82</b>
                          <span>/ 100</span>
                        </span>
                        <span className="tag ok">
                          <i />
                          GO
                        </span>
                      </div>
                      <div className="krow">
                        <span className="krow-t">Adéquation technique</span>
                        <span className="bar">
                          <i style={{ width: "92%" }} />
                        </span>
                        <em>92</em>
                      </div>
                      <div className="krow">
                        <span className="krow-t">Capacités disponibles</span>
                        <span className="bar">
                          <i style={{ width: "70%" }} />
                        </span>
                        <em>70</em>
                      </div>
                      <div className="krow">
                        <span className="krow-t">Critères de notation</span>
                        <span className="bar">
                          <i style={{ width: "84%" }} />
                        </span>
                        <em>84</em>
                      </div>
                      <div className="krow">
                        <span className="krow-t">Contraintes</span>
                        <span className="bar">
                          <i style={{ width: "58%" }} />
                        </span>
                        <em>58</em>
                      </div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-h">
                      Mémoire technique <span>10 chapitres</span>
                    </div>
                    <div className="panel-b">
                      <div className="krow">
                        <span className="krow-t">Progression</span>
                        <span className="bar">
                          <i style={{ width: "64%" }} />
                        </span>
                        <em>64 %</em>
                      </div>
                      <div className="krow">
                        <span className="krow-t">Exigences couvertes</span>
                        <span className="bar ok">
                          <i style={{ width: "96%" }} />
                        </span>
                        <em>96 %</em>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <div className="req">
                          <span className="box on" />
                          <span>
                            <span className="req-t">
                              3. Organisation du chantier
                            </span>
                            <span className="req-s">
                              CCTP.pdf p.42, base entreprise
                            </span>
                          </span>
                        </div>
                        <div className="req">
                          <span className="box" />
                          <span>
                            <span className="req-t">7. Environnement</span>
                            <span className="req-s">Critère à renforcer</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-h">
                      Alertes <span>Avant dépôt</span>
                    </div>
                    <div className="panel-b">
                      <div className="flag risk">
                        <b>Assurance décennale à vérifier</b>
                        <span>RC.pdf p.12</span>
                      </div>
                      <div className="flag warn">
                        <b>Interface entre lots insuffisamment traitée</b>
                        <span>CCTP.pdf p.57</span>
                      </div>
                      <div className="flag warn">
                        <b>Réponse trop générique</b>
                        <span>Chapitre 7</span>
                      </div>
                      <div className="flag warn">
                        <b>Critère environnemental à renforcer</b>
                        <span>RC.pdf p.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MockupFrame>
        </HeroVisual>
      </div>
    </section>
  );
}
