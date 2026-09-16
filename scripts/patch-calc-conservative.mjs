import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

// Sliders: narrower realistic ranges, default 12 dossiers × 20 h
html = html.replace(
  /id="materia-calc-dossiers" class="mc-range" type="range" min="1" max="80" step="1" value="12"/,
  'id="materia-calc-dossiers" class="mc-range" type="range" min="1" max="40" step="1" value="12"'
);
html = html.replace(
  /id="materia-calc-hours" class="mc-range" type="range" min="10" max="120" step="5" value="40"/,
  'id="materia-calc-hours" class="mc-range" type="range" min="8" max="50" step="2" value="20"'
);
html = html.replace(
  'id="materia-calc-hours-val">40 h</span>',
  'id="materia-calc-hours-val">20 h</span>'
);
html = html.replace(
  '<span id="materia-calc-saved-hours">336</span>',
  '<span id="materia-calc-saved-hours">84</span>'
);
html = html.replace(
  '<span id="materia-calc-saved-days">42</span>',
  '<span id="materia-calc-saved-days">11</span>'
);

html = html.replace(
  "Lecture DCE, exigences, mémoire, contrôle",
  "Analyse DCE, extraction d'exigences, rédaction mémoire"
);

html = html.replace(
  "Estimation indicative (~70&nbsp;% de gain par dossier). Vous gardez la main sur chaque contenu généré.",
  "Estimation indicative (~35&nbsp;% de gain sur les phases assistées). Vous gardez la main sur chaque contenu généré."
);

// 35 % savings on assisted-task hours only
html = html.replace("var R=0.7", "var R=0.35");

if (!html.includes("var R=0.35")) {
  throw new Error("Calculator rate patch failed");
}

fs.writeFileSync(htmlPath, html);
console.log("calculator tuned to conservative 35% on assisted hours");
