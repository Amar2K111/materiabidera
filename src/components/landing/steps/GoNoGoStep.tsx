import { MockupFrame } from "../MockupFrame";

/** Étape 2, décision Go / No-Go. */
export function GoNoGoStep() {
  return (
    <section className="sec sec--paper sec--line">
      <div className="wrap split split--rev rv">
        <div className="split-txt">
          <p className="kicker">Étape 2, décision</p>
          <h2 className="h2">
            Sachez si le marché mérite vos efforts avant de mobiliser vos
            équipes.
          </h2>
          <p className="lede">
            Adéquation technique, capacités disponibles, critères de
            notation, contraintes, risques et délais : BIDERA réunit les
            facteurs de la décision et les rend explicables, un par un.
          </p>
          <p className="note" style={{ marginTop: 24 }}>
            Le score éclaire la décision, il ne la prend pas. L’arbitrage
            reste celui de l’entreprise.
          </p>
        </div>

        <figure>
          <MockupFrame
            flat
            ariaLabel="Analyse Go/No-Go dans BIDERA : score de 82 sur 100, recommandation GO, et détail des six facteurs de décision."
            crumb={<b>Go / No-Go</b>}
            right={
              <span className="tag ok">
                <i />
                Recommandation : GO
              </span>
            }
          >
            <div className="ui-main">
              <div className="panel">
                <div className="panel-b" style={{ paddingTop: 16 }}>
                  <div className="score ok">
                    <b>82</b>
                    <span>/ 100</span>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div className="krow">
                      <span className="krow-t">Adéquation technique</span>
                      <span className="bar ok">
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
                    <div className="krow">
                      <span className="krow-t">Risques</span>
                      <span className="bar">
                        <i style={{ width: "61%" }} />
                      </span>
                      <em>61</em>
                    </div>
                    <div className="krow">
                      <span className="krow-t">Délais</span>
                      <span className="bar">
                        <i style={{ width: "64%" }} />
                      </span>
                      <em>64</em>
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel" style={{ marginTop: 12 }}>
                <div className="panel-h">Ce qui pèse sur la décision</div>
                <div className="panel-b">
                  <div className="flag ok">
                    <b>Valeur technique notée à 60 %</b>
                    <span>Le mémoire pèse plus que le prix</span>
                  </div>
                  <div className="flag warn">
                    <b>Capacités mobilisables en mars et avril</b>
                    <span>Contrainte à confirmer en interne</span>
                  </div>
                </div>
              </div>
            </div>
          </MockupFrame>
        </figure>
      </div>
    </section>
  );
}
