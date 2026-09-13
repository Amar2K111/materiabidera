import fs from "fs";

const IMG_V = "14";
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
    ? "hero-banner-media hero-banner-media--mobile w-full sm:hidden"
    : "hero-banner-media hidden sm:block";
  const sizes = mobile ? "100vw" : "(min-width: 640px) 48vw, 1px";
  return `<div class="${root}"><div class="hero-banner-media__stage"><div class="hero-banner-media__frame"><div class="hero-banner-media__chrome" aria-hidden="true"><div class="hero-banner-media__dots"><span></span><span></span><span></span></div><div class="hero-banner-media__url">materiabtp.info</div></div><div class="hero-banner-media__viewport"><picture><img loading="eager" decoding="async" class="hero-banner-media__img" src="${SRC}" srcSet="${SRCSET}" sizes="${sizes}" alt="${ALT}" fetchPriority="high"/></picture></div></div></div></div>`;
}

let html = fs.readFileSync("index.html", "utf8");

const visualRe =
  /<div class="hero-tenderbolt__visual min-w-0">[\s\S]*?<\/div>(?=<\/div><div class="relative mx-auto mt-stack-sm)/;

if (!visualRe.test(html)) {
  console.error("Bloc hero-tenderbolt__visual introuvable");
  process.exit(1);
}

html = html.replace(
  visualRe,
  `<div class="hero-tenderbolt__visual min-w-0">${mockup(false)}${mockup(true)}</div>`,
);

html = html.replace(
  /hero-banner-media\.css\?v=\d+/,
  "hero-banner-media.css?v=4",
);
html = html.replace(
  /materia-brand-alignment\.css\?v=\d+/,
  "materia-brand-alignment.css?v=12",
);

fs.writeFileSync("index.html", html, "utf8");
console.log("Mockup ordinateur restaure dans index.html");
