import { CalendlyDemoLink } from "../CalendlyDemoLink";
import { MockupFrame } from "../MockupFrame";

/** Étape 7, contrôle qualité. */
export function QualityStep() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Étape 7, contrôle</p>
          <h2 className="h2">
            Avant de déposer votre offre, contrôlez ce qui manque.
          </h2>
          <p className="lede">
            MateriaBTP compare votre réponse aux exigences du marché et signale
            ce qui est absent, partiel, trop générique ou non vérifié.
            C’est l’étape que les outils de rédaction n’ont pas.
          </p>
        </div>

        <figure className="rv" style={{ marginTop: 44 }}>
          <MockupFrame
            ariaLabel="Contrôle de la réponse dans MateriaBTP : 96 pour cent des exigences couvertes, 3 points à revoir, 2 informations à vérifier et 1 critère insuffisamment développé."
            crumb={<b>Contrôle de la réponse</b>}
            right={<span className="tag">Lot 3</span>}
          >
            <div className="ui-main">
              <div className="metrics metrics--4">
                <div className="metric is-ok">
                  <b>96 %</b>
                  <span>exigences couvertes</span>
                </div>
                <div className="metric is-warn">
                  <b>3</b>
                  <span>points à revoir</span>
                </div>
                <div className="metric is-warn">
                  <b>2</b>
                  <span>informations à vérifier</span>
                </div>
                <div className="metric is-risk">
                  <b>1</b>
                  <span>critère insuffisamment développé</span>
                </div>
              </div>

              <div className="panel" style={{ marginTop: 14 }}>
                <div className="panel-h">
                  Détail des points signalés{" "}
                  <span>Chacun renvoie au passage concerné</span>
                </div>
                <div className="panel-b">
                  <div className="flag risk">
                    <b>Assurance décennale à vérifier</b>
                    <span>
                      RC.pdf p.12, aucune pièce correspondante dans la base
                      entreprise
                    </span>
                  </div>
                  <div className="flag warn">
                    <b>Interface entre lots insuffisamment traitée</b>
                    <span>CCTP.pdf p.57, réponse partielle au chapitre 3</span>
                  </div>
                  <div className="flag warn">
                    <b>Réponse trop générique</b>
                    <span>Chapitre 9, qualité</span>
                  </div>
                  <div className="flag warn">
                    <b>Critère environnemental à renforcer</b>
                    <span>RC.pdf p.8, critère noté sur 10 points</span>
                  </div>
                </div>
              </div>
            </div>
          </MockupFrame>
        </figure>

        <p className="demo rv">
          <i aria-hidden="true" />
          Les chiffres affichés dans cette interface sont des données de
          démonstration sur un dossier fictif.
        </p>

        <div className="relance rv">
          <div>
            <b>Faire contrôler une réponse déjà rédigée</b>
            <span>
              Apportez un mémoire terminé, nous le passons au contrôle de
              couverture avec vous.
            </span>
          </div>
          <CalendlyDemoLink className="btn btn--primary">
            Réserver une démo
          </CalendlyDemoLink>
        </div>
      </div>
    </section>
  );
}
