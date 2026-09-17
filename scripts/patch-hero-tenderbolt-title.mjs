import fs from "fs";
import path from "path";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
  PLUMTECH_MODAL_HTML,
} from "../src/components/landing/plumtech/landing-markup.ts";

let body = PLUMTECH_BODY_HTML;

const heroIdx = body.indexOf("hero-materia");
if (heroIdx === -1) {
  console.error("hero-materia not found");
  process.exit(1);
}

const colStart = body.indexOf(
  '<div class="flex flex-col items-start gap-stack-sm">',
  heroIdx,
);
const colEnd = body.indexOf('<div class="hero-materia__visual', colStart);
if (colStart === -1 || colEnd === -1) {
  console.error("hero copy column not found");
  process.exit(1);
}

const col = body.slice(colStart, colEnd);

const ctaMatch = col.match(
  /<button type="button" class="btn-calendly[\s\S]*?<\/button>/,
);
const cta = ctaMatch?.[0] ?? "";

const newCol =
  '<div class="flex flex-col items-start gap-stack-sm">' +
  '<h1 class="font-display font-bold text-display text-balance leading-[1.05]">' +
  "Le logiciel IA de r\u00e9ponse aux appels d&#x27;offres et RFP " +
  '<span class="text-stone-900">con\u00e7u pour gagner</span></h1>' +
  '<p class="max-w-xl font-body text-body text-stone-800 leading-[1.45]">' +
  "La plateforme MateriaBTP transforme votre savoir-faire en r\u00e9ponses aux appels d&#x27;offres BTP. Analyse du DCE, Go/No-Go, exigences et m\u00e9moire technique&nbsp;: toutes les \u00e9tapes, au m\u00eame endroit." +
  "</p>" +
  cta +
  "</div>";

body = body.slice(0, colStart) + newCol + body.slice(colEnd);

const h1s = [...body.slice(heroIdx, heroIdx + 4000).matchAll(/<h1[\s\S]*?<\/h1>/g)];
console.log("hero h1 count:", h1s.length);
console.log("hero h1:", h1s[0]?.[0]?.replace(/<[^>]+>/g, " ").trim());

const out = `/** Generated from index.html \u2014 ne pas editer a la main. Relancer: node scripts/extract-plumtech-landing.mjs */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(PLUMTECH_INLINE_STYLE)};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(body)};
export const PLUMTECH_MODAL_HTML = ${JSON.stringify(PLUMTECH_MODAL_HTML)};
`;

fs.writeFileSync(
  path.join("src", "components", "landing", "plumtech", "landing-markup.ts"),
  out,
  "utf8",
);
console.log("hero title updated to Tenderbolt structure");
