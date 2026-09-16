#!/usr/bin/env node
/**
 * Restaure les formes décoratives Tenderbolt derrière les captures feature cards
 * et bascule les src PNG → AVIF quand disponibles.
 */
import fs from "node:fs";
import path from "node:path";

const INDEX = path.join(import.meta.dirname, "..", "index.html");
const SHAPE = "./materiabtp-assets/images/shape.svg";

function shapeLayer(tone) {
  const bg = tone === "ember" ? "bg-ember-100" : "bg-lazuli-300";
  const base =
    "height:95%;aspect-ratio:3.0699786324786325;transform:translateX(-50%) translateY(-50%);mask-image:url(" +
    SHAPE +
    ");mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-image:url(" +
    SHAPE +
    ");-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat";
  return (
    `<div aria-hidden="true" class="pointer-events-none absolute bg-no-repeat bg-size-[100%_100%] ${bg}" style="${base};left:118%;top:22%"></div>` +
    `<div aria-hidden="true" class="pointer-events-none absolute bg-no-repeat bg-size-[100%_100%] ${bg}" style="${base};left:-18%;top:88%"></div>`
  );
}

const DECO = {
  "translate(-12%, 12%)": shapeLayer("lazuli"),
  "translate(0%, 0%)": shapeLayer("ember"),
  "translate(12%, -12%)": shapeLayer("lazuli"),
  "translate(24%, -24%)": shapeLayer("ember"),
};

let html = fs.readFileSync(INDEX, "utf8");

for (const [transform, inner] of Object.entries(DECO)) {
  const empty = `<div aria-hidden="true" class="absolute inset-0" style="transform:${transform}"></div>`;
  const filled = `<div aria-hidden="true" class="absolute inset-0" style="transform:${transform}">${inner}</div>`;
  if (html.includes(empty)) {
    html = html.replace(empty, filled);
  }
}

const pngToAvif = [
  ["features/cards/analysis-fr.png", "features/cards/analysis-fr.avif"],
  ["_r/features/cards/analysis-fr-480.png", "_r/features/cards/analysis-fr-480.avif"],
  ["_r/features/cards/analysis-fr-640.png", "_r/features/cards/analysis-fr-640.avif"],
  ["_r/features/cards/analysis-fr-960.png", "_r/features/cards/analysis-fr-960.avif"],
  ["features/cards/questionnaire-fr.png", "features/cards/questionnaire-fr.avif"],
  ["_r/features/cards/questionnaire-fr-480.png", "_r/features/cards/questionnaire-fr-480.avif"],
  ["_r/features/cards/questionnaire-fr-640.png", "_r/features/cards/questionnaire-fr-640.avif"],
  ["_r/features/cards/questionnaire-fr-960.png", "_r/features/cards/questionnaire-fr-960.avif"],
  ["features/cards/proposal-fr.png", "features/cards/proposal-fr.avif"],
  ["_r/features/cards/proposal-fr-480.png", "_r/features/cards/proposal-fr-480.avif"],
  ["_r/features/cards/proposal-fr-640.png", "_r/features/cards/proposal-fr-640.avif"],
  ["_r/features/cards/proposal-fr-960.png", "_r/features/cards/proposal-fr-960.avif"],
  ["features/cards/knowledge-base-fr.png", "features/cards/knowledge-base-fr.avif"],
  ["_r/features/cards/knowledge-base-fr-480.png", "_r/features/cards/knowledge-base-fr-480.avif"],
  ["_r/features/cards/knowledge-base-fr-640.png", "_r/features/cards/knowledge-base-fr-640.avif"],
  ["_r/features/cards/knowledge-base-fr-960.png", "_r/features/cards/knowledge-base-fr-960.avif"],
];

for (const [from, to] of pngToAvif) {
  const rel = `./materiabtp-assets/images/${from}`;
  const avif = `./materiabtp-assets/images/${to}`;
  if (fs.existsSync(path.join(process.cwd(), "materiabtp-assets/images", to))) {
    html = html.replaceAll(rel, avif);
  }
}

fs.writeFileSync(INDEX, html, "utf8");
console.log("patch-feature-card-visuals: décorations + AVIF appliqués");
