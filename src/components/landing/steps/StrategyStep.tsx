import { MockupFrame } from "../MockupFrame";

/** Étape 5, stratégie de réponse. */
export function StrategyStep() {
  return (
    <section className="sec">
      <div className="wrap split rv">
        <div className="split-txt">
          <p className="kicker">Étape 5, stratégie</p>
          <h2 className="h2">
            Les critères du marché deviennent vos axes de réponse.
          </h2>
          <p className="lede">
            Avant d’écrire la moindre ligne, BIDERA transforme la grille de
            jugement de l’acheteur en une stratégie : ce qu’il faut
            démontrer, avec quel niveau de détail, et sur quels éléments de
            votre entreprise s’appuyer.
          </p>
        </div>

        <figure>
          <MockupFrame
            flat
            ariaLabel="Stratégie de réponse dans BIDERA : critères de jugement du marché traduits en axes de réponse et en chapitres du mémoire."
            crumb={<b>Stratégie de réponse</b>}
            right={
              <span className="tag blue">
                <i />
                4 axes
              </span>
            }
          >
            <div className="ui-main">
              <div className="panel">
                <div className="panel-h">
                  Critère, axe et appui <span>Pondération</span>
                </div>
                <div className="panel-b">
                  <div className="req">
                    <span className="box on" />
                    <span>
                      <span className="req-t">
                        Organisation du chantier, 20 points
                      </span>
                      <span className="req-s">
                        Axe : phasage en site occupé, appui sur la référence
                        collège
                      </span>
                    </span>
                  </div>
                  <div className="req">
                    <span className="box on" />
                    <span>
                      <span className="req-t">Méthodologie, 20 points</span>
                      <span className="req-s">
                        Axe : modes opératoires internes, appui sur la
                        procédure QSE
                      </span>
                    </span>
                  </div>
                  <div className="req">
                    <span className="box on" />
                    <span>
                      <span className="req-t">Moyens humains, 10 points</span>
                      <span className="req-s">
                        Axe : encadrement dédié, appui sur les CV
                      </span>
                    </span>
                  </div>
                  <div className="req">
                    <span className="box" />
                    <span>
                      <span className="req-t">Environnement, 10 points</span>
                      <span className="req-s">
                        Axe à renforcer, peu d’éléments disponibles
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                <span className="tag ok">
                  <i />
                  3 axes documentés
                </span>
                <span className="tag warn">
                  <i />1 axe à renforcer
                </span>
              </div>
            </div>
          </MockupFrame>
        </figure>
      </div>
    </section>
  );
}
