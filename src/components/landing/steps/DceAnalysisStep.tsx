import { MockupFrame } from "../MockupFrame";

/** Étape 1, analyse du DCE (ancre #fonctionnalites). */
export function DceAnalysisStep() {
  return (
    <section className="sec" id="fonctionnalites">
      <div className="wrap split rv">
        <div className="split-txt">
          <p className="kicker">Étape 1, analyse du DCE</p>
          <h2 className="h2">487 pages. Une seule vue.</h2>
          <p className="lede">
            RC, CCTP, CCAP, DPGF et annexes sont analysés ensemble. BIDERA en
            ressort les informations qui comptent : exigences, critères de
            jugement, échéances et points de vigilance.
          </p>
          <p className="pull" style={{ marginTop: 30 }}>
            Passez du DCE complexe à une lecture partagée dès la première
            réunion.
          </p>
        </div>

        <figure>
          <MockupFrame
            flat
            ariaLabel="Analyse d’un DCE dans BIDERA : 24 documents, 487 pages, 86 exigences, 12 points de vigilance, pièces détectées et critères de notation."
            crumb={<b>Analyse du dossier</b>}
            right={
              <span className="tag ok">
                <i />
                Terminée
              </span>
            }
          >
            <div className="ui-main">
              <div className="metrics metrics--4">
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
              </div>

              <div className="panel" style={{ marginTop: 14 }}>
                <div className="panel-h">
                  Pièces du marché <span>Type reconnu</span>
                </div>
                <div className="panel-b">
                  <div className="file">
                    <span className="file-ic">RC</span>
                    <span className="file-n">
                      RC.pdf, règlement de consultation
                    </span>
                    <span className="file-m">18 p.</span>
                  </div>
                  <div className="file">
                    <span className="file-ic">CCTP</span>
                    <span className="file-n">CCTP.pdf, clauses techniques</span>
                    <span className="file-m">214 p.</span>
                  </div>
                  <div className="file">
                    <span className="file-ic">CCAP</span>
                    <span className="file-n">
                      CCAP.pdf, clauses administratives
                    </span>
                    <span className="file-m">46 p.</span>
                  </div>
                  <div className="file">
                    <span className="file-ic">DPGF</span>
                    <span className="file-n">DPGF.xlsx</span>
                    <span className="file-m">9 onglets</span>
                  </div>
                  <div className="file">
                    <span className="file-ic">ANX</span>
                    <span className="file-n">Annexes et plans</span>
                    <span className="file-m">20 pièces</span>
                  </div>
                </div>
              </div>

              <div className="panels panels--2" style={{ marginTop: 14 }}>
                <div className="panel">
                  <div className="panel-h">Critères de jugement</div>
                  <div className="panel-b">
                    <div className="krow">
                      <span className="krow-t">Valeur technique</span>
                      <span className="bar">
                        <i style={{ width: "60%" }} />
                      </span>
                      <em>60 %</em>
                    </div>
                    <div className="krow">
                      <span className="krow-t">Prix</span>
                      <span className="bar ink">
                        <i style={{ width: "30%" }} />
                      </span>
                      <em>30 %</em>
                    </div>
                    <div className="krow">
                      <span className="krow-t">Délai</span>
                      <span className="bar ink">
                        <i style={{ width: "10%" }} />
                      </span>
                      <em>10 %</em>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-h">Échéances et vigilance</div>
                  <div className="panel-b">
                    <div className="flag blue">
                      <b>Remise le 26 à 12 h 00</b>
                      <span>RC.pdf p.3</span>
                    </div>
                    <div className="flag warn">
                      <b>Visite de site obligatoire</b>
                      <span>RC.pdf p.18</span>
                    </div>
                    <div className="flag warn">
                      <b>Chantier en site occupé</b>
                      <span>CCTP.pdf p.24</span>
                    </div>
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
