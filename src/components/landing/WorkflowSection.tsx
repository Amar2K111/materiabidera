import { CalendlyDemoLink } from "./CalendlyDemoLink";

const STEPS = [
  {
    n: "01",
    title: "Analysez votre DCE",
    text: "Importez les documents du marché. BIDERA les structure et identifie les informations importantes.",
  },
  {
    n: "02",
    title: "Décidez de répondre",
    text: "Obtenez une analyse Go / No-Go avec des facteurs explicables, pas un simple verdict.",
  },
  {
    n: "03",
    title: "Identifiez les exigences",
    text: "Visualisez chaque exigence, sa source dans le dossier et son état de couverture.",
  },
  {
    n: "04",
    title: "Mobilisez votre base entreprise",
    text: "Références, méthodes, certifications, moyens, CV et documents QSE deviennent exploitables.",
  },
  {
    n: "05",
    title: "Construisez votre stratégie",
    text: "Les critères de jugement du marché sont transformés en axes de réponse.",
  },
  {
    n: "06",
    title: "Générez votre mémoire",
    text: "Le mémoire est construit selon le marché et les informations réelles de votre entreprise.",
  },
  {
    n: "07",
    title: "Contrôlez votre réponse",
    text: "BIDERA vérifie la couverture des exigences et signale les points faibles.",
  },
  {
    n: "08",
    title: "Exportez",
    text: "Téléchargez votre réponse en Word ou en PDF.",
  },
] as const;

export function WorkflowSection() {
  return (
    <section className="sec sec--paper sec--line" id="workflow">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Comment ça marche</p>
          <h2 className="h2">
            Transformez des centaines de pages de DCE en une stratégie de
            réponse claire.
          </h2>
          <p className="lede">
            Huit étapes, dans l’ordre où une entreprise BTP prépare
            réellement une réponse.
          </p>
        </div>

        <ol className="flow rv-group">
          {STEPS.map((s) => (
            <li className="flow-i rv-item" key={s.n}>
              <b>{s.n}</b>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="relance rv">
          <div>
            <b>Le workflow complet sur votre propre dossier</b>
            <span>
              Apportez un DCE en cours, nous le déroulons de bout en bout
              avec vous.
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
