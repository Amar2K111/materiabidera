import { MockupFrame } from "../MockupFrame";

const PLAN = [
  "1. Compréhension du besoin",
  "2. Méthodologie",
  "3. Organisation du chantier",
  "4. Moyens humains",
  "5. Moyens matériels",
  "6. Planning",
  "7. Environnement",
  "8. Sécurité",
  "9. Qualité",
  "10. Références",
] as const;

/** Étape 6, mémoire technique. */
export function MemoryStep() {
  return (
    <section className="sec sec--paper sec--line">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Étape 6, mémoire technique</p>
          <h2 className="h2">
            Un mémoire construit à partir du marché et de votre entreprise.
          </h2>
          <p className="lede">
            MateriaBTP génère le mémoire chapitre par chapitre, en s’appuyant
            sur les exigences du DCE et sur les éléments réels de votre base
            entreprise. Chaque passage indique ses sources.
          </p>
        </div>

        <figure className="rv" style={{ marginTop: 44 }}>
          <MockupFrame
            ariaLabel="Rédaction du mémoire technique dans MateriaBTP : plan par chapitres, texte généré, sources citées issues du CCTP et de la base entreprise."
            crumb={
              <>
                Mémoire / <b>Chapitre 3, organisation du chantier</b>
              </>
            }
            right={
              <span className="tag ok">
                <i />7 exigences couvertes
              </span>
            }
            foot={
              <>
                <p>
                  Rédigé à partir de 2 pièces du DCE et 2 éléments de votre
                  base entreprise
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="ui-btn ui-btn--ghost">
                    Voir les sources
                  </span>
                  <span className="ui-btn">Contrôler la réponse</span>
                </div>
              </>
            }
          >
            <div className="editor">
              <aside className="editor-plan">
                <p className="ui-side-t">Plan du mémoire</p>
                <ul>
                  {PLAN.map((item) => (
                    <li key={item} className={item.startsWith("3.") ? "on" : undefined}>
                      {item}
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="editor-doc">
                <h4>3.2, phasage en site occupé</h4>
                <p>
                  L’établissement restant en activité pendant toute la durée
                  des travaux, le phasage est construit autour des périodes
                  de vacances scolaires pour les interventions bruyantes et
                  les dépose de menuiseries.{" "}
                  <mark>
                    Les zones de circulation des élèves sont séparées des
                    emprises chantier par un cloisonnement plein maintenu en
                    permanence.
                  </mark>
                </p>
                <p>
                  La base vie est implantée sur le parking nord, hors du
                  flux d’entrée principal. Les livraisons sont programmées
                  avant 8 h et après 17 h, en dehors des horaires d’accueil.
                </p>
                <div className="srcs">
                  <span className="tag blue">
                    <i />
                    CCTP.pdf p.24
                  </span>
                  <span className="tag blue">
                    <i />
                    CCTP.pdf p.42
                  </span>
                  <span className="tag">
                    <i />
                    Procédure interne, site occupé
                  </span>
                  <span className="tag">
                    <i />
                    Référence, rénovation collège
                  </span>
                </div>
              </div>
            </div>
          </MockupFrame>
        </figure>

        <p className="note rv" style={{ marginTop: 26, maxWidth: "74ch" }}>
          MateriaBTP prépare le mémoire, il ne le signe pas. La relecture, les
          arbitrages et la validation finale restent le travail de vos
          équipes.
        </p>
      </div>
    </section>
  );
}
