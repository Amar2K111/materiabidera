const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

/**
 * Accents MateriaBTP — couleurs DISTINCTES, complémentaires au logo (blanc + #5ba3e8).
 * Pas des déclinaisons de bleu : or chaud, lavande, menthe, + bleu marque.
 */
const ICON = {
  blue: "#5ba3e8", // logo BTP / ciel
  amber: "#e8b84a", // or chaud — complémentaire au bleu
  purple: "#b09cf0", // lavande douce
  teal: "#52c4a8", // menthe — pro BTP
  lime: "#9bc86a", // sauge
  peach: "#e8925a", // corail doux (secours)
};

const tokenBlock =
  `--color-icon-purple:${ICON.purple};--color-icon-amber:${ICON.amber};--color-icon-teal:${ICON.teal};--color-icon-lime:${ICON.lime};--color-icon-blue:${ICON.blue}`;

html = html.replace(
  /--color-icon-purple:[^;]+;--color-icon-amber:[^;]+;--color-icon-teal:[^;]+;--color-icon-lime:[^;]+;--color-icon-blue:[^;]+/g,
  tokenBlock,
);

// Anciennes valeurs bleues ou Tenderbolt
const replacements = [
  [/#3580d41a/gi, `${ICON.amber}1a`],
  [/#7eb0dc1a/gi, `${ICON.purple}1a`],
  [/#4d74c41a/gi, `${ICON.teal}1a`],
  [/#8ec5f61a/gi, `${ICON.lime}1a`],
  [/#5ba3e81a/gi, `${ICON.blue}1a`],
  [/#db9d6a1a/gi, `${ICON.amber}1a`],
  [/#6b9fd41a/gi, `${ICON.blue}1a`],
  [/#7cb6c31a/gi, `${ICON.teal}1a`],
  [/#b9c6611a/gi, `${ICON.lime}1a`],
];
for (const [from, to] of replacements) {
  html = html.replace(from, to);
}

fs.writeFileSync(indexPath, html);
console.log("MateriaBTP multi-color accent palette applied");
