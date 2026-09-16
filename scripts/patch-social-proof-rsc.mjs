import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const replacements = [
  [
    "Découvrez comment MateriaBTP transforme leurs réponses aux appels d'offres",
    "Trois différences concrètes sur votre prochain appel d'offres BTP.",
  ],
  [
    "« MateriaBTP a eu un impact très concret avec un ROI de x7. Les équipes gagnent un temps précieux pour travailler sur le fond et l'opérationnel. »",
    "RC, CCTP, CCAP et annexes décortiqués rapidement. Go / No-Go argumenté avec sources — vous tranchez.",
  ],
  [
    "« MateriaBTP nous fait économiser 34 heures en moyenne par RFP, et c'est aussi un gage de fiabilité pour les réponses. »",
    "Chaque exigence reliée au DCE. Couverture, lacunes et priorités visibles avant de rédiger le mémoire.",
  ],
  [
    "« Nous avons augmenté notre taux de succès de 25% en faisant une meilleure analyse au départ et en personnalisant nos propositions. »",
    "Contenu fondé sur votre base entreprise : références, moyens, méthodes. Contrôle avant export Word ou PDF.",
  ],
  ['"children":"Travaux publics"', '"children":"Étape 1"'],
  ['"children":"1200 salariés"', '"children":"Analyse DCE"'],
  ['"children":"Logiciel"', '"children":"Étape 2"'],
  ['"children":"420 salariés"', '"children":"Exigences tracées"'],
  ['"children":"ESN"', '"children":"Étape 3"'],
  ['"children":"800 salariés"', '"children":"Mémoire technique"'],
  ["Hervé L.", "Analyse DCE en quelques minutes"],
  ["Responsable des études", "Go / No-Go argumenté, sources DCE"],
  ["Nathalie I.", "Exigences tracées à la source"],
  ["Chief Revenue Officer", "Couverture visible avant rédaction"],
  ["Christian N.", "Mémoire technique sans invention"],
  ["Directeur général", "Base entreprise, sans invention"],
  ["Soyez le prochain, rejoignez-nous !", "Voyez la différence sur votre prochain dossier."],
];

for (const [from, to] of replacements) {
  html = html.split(from).join(to);
}

// Drop star rating blocks from RSC (testimonial chrome)
html = html.replace(/,\[\s*"\$","\$L\d+",null,\{[^]*?"tabler-icon-star-filled[^]*?\}\]\]/g, "");

fs.writeFileSync(htmlPath, html);
console.log("RSC testimonial strings patched");
console.log("ROI refs left:", (html.match(/ROI de x7/g) ?? []).length);
