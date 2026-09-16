import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const gridOld =
  '<div class="relative max-w-7xl mx-auto min-h-[60vh] grid items-start px-stack sm:pl-gutter sm:pr-2 min-[82rem]:px-0 gap-stack-sm sm:gap-stack lg:gap-section sm:grid-cols-2"><div class="flex flex-col items-start gap-stack-sm">';

const gridNew =
  '<div class="relative max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center text-center px-stack sm:px-gutter min-[82rem]:px-0 gap-stack lg:gap-section hero-centered"><div class="pointer-events-none absolute inset-0 -z-10 h-[round(up,100%,50rem)] overflow-visible" aria-hidden="true"><div class="hero-centered__shape hero-centered__shape--a"></div><div class="hero-centered__shape hero-centered__shape--b"></div></div><div class="flex flex-col items-center gap-stack-sm max-w-3xl mx-auto w-full">';

if (!html.includes(gridOld)) {
  console.error("Hero grid pattern introuvable");
  process.exit(1);
}

html = html.replace(gridOld, gridNew);

html = html.replace(
  '<ul class="flex flex-col">',
  '<ul class="mx-auto flex w-full max-w-xl flex-col items-start text-left">',
);

html = html.replace(
  '<div class="min-w-0 hero-visual-col">',
  '<div class="w-full hero-visual-col hero-visual-col--center">',
);

html = html.replaceAll(
  'sizes="(min-width: 640px) 48vw, 1px"',
  'sizes="(min-width: 640px) 64vw, 1px"',
);

html = html.replace(
  '<div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block"><p class="hero-trust-caption relative text-center font-display text-lead text-stone-800 px-stack">Conçu pour les PME BTP qui répondent aux marchés publics et privés.</p></div></div>',
  `<div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block hero-centered__trust"><div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-white to-40% -top-block"></div><p class="hero-trust-caption relative text-center font-display text-lead text-stone-800 px-stack">Conçu pour les PME BTP qui répondent aux marchés publics et privés.</p><div class="relative flex flex-wrap items-center justify-center gap-stack-sm px-stack sm:gap-stack"><img src="./materiabtp-assets/images/logos/crit.svg" alt="Crit" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/diot_siaci.svg" alt="Diot Siaci" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/bunzl.svg" alt="Bunzl" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/bechtle.svg" alt="Bechtle" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/roux_tp.svg" alt="Roux TP" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/generix.svg" alt="Generix" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/afpa.svg" alt="AFPA" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/></div></div>`,
);

html = html.replace(
  /materia-brand-alignment\.css\?v=\d+/,
  "materia-brand-alignment.css?v=9",
);
html = html.replace(
  /materia-plumtech-theme\.css\?v=\d+/,
  "materia-plumtech-theme.css?v=9",
);
html = html.replace(
  /hero-banner-media\.css(\?v=\d+)?/,
  "hero-banner-media.css?v=2",
);

fs.writeFileSync("index.html", html);
console.log("Hero centre (style Tenderbolt) applique sur index.html");
