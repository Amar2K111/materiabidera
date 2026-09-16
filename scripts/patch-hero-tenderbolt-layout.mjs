import fs from "fs";

const SRC =
  "./materiabtp-assets/images/hero/dashboard-fr.png";
const SRCSET =
  "./materiabtp-assets/images/_r/hero/dashboard-fr-480.png 480w, ./materiabtp-assets/images/_r/hero/dashboard-fr-640.png 640w, ./materiabtp-assets/images/_r/hero/dashboard-fr-960.png 960w, ./materiabtp-assets/images/_r/hero/dashboard-fr-1440.png 1440w, ./materiabtp-assets/images/hero/dashboard-fr.png 1440w";
const ALT =
  "Capture MateriaBTP : tableau de bord avec dossiers appels d'offres BTP en cours";

const IMG_DESKTOP = `<img loading="eager" decoding="async" src="${SRC}" srcSet="${SRCSET}" sizes="(min-width: 640px) 64vw, 1px" alt="${ALT}" fetchPriority="high" class="hero-dashboard-shot hidden sm:block w-[64vw] max-w-none"/>`;
const IMG_MOBILE = `<img loading="eager" decoding="async" src="${SRC}" srcSet="${SRCSET}" sizes="(min-width: 640px) 1px, 87vw" alt="${ALT}" fetchPriority="high" class="hero-dashboard-shot w-full sm:hidden"/>`;

const SHAPES = `<div class="pointer-events-none absolute inset-0 -z-10 h-[round(up,100%,50rem)] overflow-visible" aria-hidden="true"><div class="hero-centered__shape hero-centered__shape--a"></div><div class="hero-centered__shape hero-centered__shape--b"></div></div>`;

const GRID_START =
  '<div class="relative max-w-7xl mx-auto min-h-[60vh] grid items-center px-stack sm:pl-gutter sm:pr-2 min-[82rem]:px-0 gap-stack-sm sm:gap-stack lg:gap-section sm:grid-cols-2 hero-tenderbolt">';

let html = fs.readFileSync("index.html", "utf8");

const start = html.indexOf(
  '<div class="relative max-w-7xl mx-auto min-h-[60vh]',
);
const trust = html.indexOf(
  '<div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block',
  start,
);

if (start === -1 || trust === -1) {
  console.error("Hero block introuvable");
  process.exit(1);
}

const textBlockMatch = html
  .slice(start, trust)
  .match(
    /<div class="flex flex-col items-(?:start|center) gap-stack-sm[^>]*>([\s\S]*?)<\/div><div class="(?:w-full hero-visual-col|hero-banner-media)/,
  );

if (!textBlockMatch) {
  console.error("Texte hero introuvable");
  process.exit(1);
}

const textInner = textBlockMatch[1]
  .replace(
    '<ul class="mx-auto flex w-full max-w-xl flex-col items-start text-left">',
    '<ul class="flex flex-col">',
  )
  .replace(
    '<ul class="flex flex-col items-start text-left">',
    '<ul class="flex flex-col">',
  );

const newGrid =
  GRID_START +
  SHAPES +
  `<div class="flex flex-col items-start gap-stack-sm">${textInner}</div>` +
  `<div class="hero-tenderbolt__visual min-w-0">${IMG_DESKTOP}${IMG_MOBILE}</div>` +
  "</div>";

html = html.slice(0, start) + newGrid + html.slice(trust);

html = html.replace(
  /hero-banner-media\.css\?v=\d+/,
  "hero-banner-media.css?v=3",
);
html = html.replace(
  /materia-brand-alignment\.css\?v=\d+/,
  "materia-brand-alignment.css?v=10",
);

fs.writeFileSync("index.html", html);
console.log("Hero aligne sur layout Tenderbolt (2 colonnes, image centree verticalement)");
