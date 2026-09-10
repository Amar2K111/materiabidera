import { MockupFrame } from "../MockupFrame";

const ITEMS = [
  { s: "ok", title: "Visite de site effectuée", detail: "RC.pdf p.18" },
  {
    s: "ok",
    title: "Trois références similaires jointes",
    detail: "Base entreprise",
  },
  {
    s: "ok",
    title: "Mémoire technique généré",
    detail: "10 chapitres",
  },
  {
    s: "warn",
    title: "Gestion des interfaces à compléter",
    detail: "CCTP.pdf p.57",
  },
  {
    s: "warn",
    title: "Critère environnemental à renforcer",
    detail: "RC.pdf p.8",
  },
  {
    s: "risk",
    title: "Attestation d’assurance décennale manquante",
    detail: "RC.pdf p.12",
  },
] as const;

/** Étape 8, checklist et export. */
export function ChecklistExportStep() {
  return (
    <section className="sec sec--paper sec--line">
      <div className="wrap split split--rev rv">
        <div className="split-txt">
          <p className="kicker">Étape 8, checklist et export</p>
          <h2 className="h2">
            La dernière vérification, puis le fichier que vous déposez.
          </h2>
          <p className="lede">
            La checklist reprend ce qui doit être en place avant la remise.
            Une fois les points levés, le mémoire s’exporte en Word ou en
            PDF, prêt pour votre mise en forme finale.
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--ghost">
              Exporter en Word
            </button>
            <button type="button" className="btn btn--ghost">
              Exporter en PDF
            </button>
          </div>
        </div>

        <figure>
          <MockupFrame
            flat
            ariaLabel="Checklist avant dépôt dans MateriaBTP, avec les éléments couverts, partiels et à vérifier, puis les boutons d’export Word et PDF."
            crumb={<b>Checklist avant dépôt</b>}
            right={<span className="tag">Remise dans 11 j</span>}
            foot={
              <>
                <p>3 points restants avant export</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="ui-btn ui-btn--ghost">Exporter PDF</span>
                  <span className="ui-btn">Exporter Word</span>
                </div>
              </>
            }
          >
            <div className="ui-main">
              <div className="panel">
                <div className="panel-b" style={{ paddingTop: 12 }}>
                  {ITEMS.map((it) => (
                    <div className="ck" key={it.title}>
                      <span className={`ck-s ${it.s}`} />
                      <span>
                        <b>{it.title}</b>
                        <span>{it.detail}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MockupFrame>
        </figure>
      </div>
    </section>
  );
}
