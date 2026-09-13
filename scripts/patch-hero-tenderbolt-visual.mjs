import fs from "fs";

const IMG_V = "25";
const q = (path) => `${path}?v=${IMG_V}`;
const SRC = q("./materiabtp-assets/images/hero/dashboard-fr.png");
const SRCSET =
  `${q("./materiabtp-assets/images/_r/hero/dashboard-fr-480.png")} 480w, ` +
  `${q("./materiabtp-assets/images/_r/hero/dashboard-fr-640.png")} 640w, ` +
  `${q("./materiabtp-assets/images/_r/hero/dashboard-fr-960.png")} 960w, ` +
  `${q("./materiabtp-assets/images/_r/hero/dashboard-fr-1440.png")} 1440w, ` +
  `${q("./materiabtp-assets/images/hero/dashboard-fr.png")} 1440w`;
const ALT =
  "Capture MateriaBTP : tableau de bord avec dossiers appels d'offres BTP en cours";

function mockup(mobile) {
  const root = mobile
    ? "hero-banner-media hero-banner-media--mobile hero-tenderbolt__mockup hero-tenderbolt__mockup--mobile"
    : "hero-banner-media hero-tenderbolt__mockup hero-tenderbolt__mockup--desktop";
  const sizes = mobile ? "100vw" : "(min-width: 640px) min(48vw, 560px), 1px";
  return `<div class="${root}"><div class="hero-banner-media__stage"><div class="hero-banner-media__frame"><div class="hero-banner-media__chrome" aria-hidden="true"><div class="hero-banner-media__dots"><span></span><span></span><span></span></div><div class="hero-banner-media__url">materiabtp.info</div></div><div class="hero-banner-media__viewport"><img loading="eager" decoding="async" class="hero-banner-media__img" src="${SRC}" srcSet="${SRCSET}" sizes="${sizes}" alt="${ALT}" fetchPriority="high"/></div></div></div></div>`;
}

const DECOS = `<div aria-hidden="true" class="hero-tenderbolt__deco hero-tenderbolt__deco--tl"><div class="absolute inset-0"></div></div><div aria-hidden="true" class="hero-tenderbolt__deco hero-tenderbolt__deco--br-lazuli"><div class="absolute inset-0"></div></div>`;

const VISUAL = `<div class="hero-tenderbolt__visual min-w-0"><div class="hero-tenderbolt__scene">${DECOS}${mockup(false)}${mockup(true)}</div></div>`;

let html = fs.readFileSync("index.html", "utf8");

const visualRe =
  /<div class="hero-tenderbolt__visual min-w-0">[\s\S]*<\/div>(?=\s*<\/div>\s*<div class="relative mx-auto mt-stack-sm)/;

if (!html.match(visualRe)) {
  console.error("Bloc hero-tenderbolt__visual introuvable");
  process.exit(1);
}

html = html.replace(visualRe, VISUAL);

html = html.replace(
  /class="relative isolate flex flex-col overflow-clip bg-white pt-header text-stone-1200 sm:justify-center"/,
  'class="relative isolate flex flex-col overflow-visible bg-white pt-header text-stone-1200 sm:justify-center"',
);

html = html.replace(
  /hero-banner-media\.css\?v=\d+/,
  "hero-banner-media.css?v=12",
);
html = html.replace(
  /materia-brand-alignment\.css\?v=\d+/,
  "materia-brand-alignment.css?v=32",
);

fs.writeFileSync("index.html", html, "utf8");
console.log("Hero : decos lazuli autour du mockup + dashboard sans carres");
