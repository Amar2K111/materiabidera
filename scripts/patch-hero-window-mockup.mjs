/**
 * Remplace le mockup laptop par une fenêtre app + recolle dans index.html.
 */
import fs from "fs";

const ALT =
  "Capture MateriaBTP : tableau de bord avec dossiers appels d'offres BTP en cours";
const SRC = "./materiabtp-assets/images/hero/dashboard-fr.png";
const SRCSET =
  "./materiabtp-assets/images/_r/hero/dashboard-fr-480.png 480w, " +
  "./materiabtp-assets/images/_r/hero/dashboard-fr-640.png 640w, " +
  "./materiabtp-assets/images/_r/hero/dashboard-fr-960.png 960w, " +
  "./materiabtp-assets/images/_r/hero/dashboard-fr-1440.png 1440w, " +
  "./materiabtp-assets/images/hero/dashboard-fr.png 1440w";

function windowMockup(className, sizes, mobile = false) {
  const mobileClass = mobile ? " hero-banner-media--mobile" : "";
  return (
    `<div class="hero-banner-media${mobileClass} ${className}">` +
    `<div class="hero-banner-media__stage">` +
    `<div class="hero-banner-media__frame">` +
    `<div class="hero-banner-media__chrome" aria-hidden="true">` +
    `<div class="hero-banner-media__dots"><span></span><span></span><span></span></div>` +
    `<div class="hero-banner-media__url">materiabtp.info</div>` +
    `</div>` +
    `<div class="hero-banner-media__viewport">` +
    `<picture>` +
    `<img loading="eager" decoding="async" class="hero-banner-media__img" ` +
    `src="${SRC}" srcSet="${SRCSET}" sizes="${sizes}" alt="${ALT}" fetchPriority="high"/>` +
    `</picture></div></div></div></div>`
  );
}

const DESKTOP = windowMockup("hidden sm:block", "(min-width: 640px) 48vw, 1px");
const MOBILE = windowMockup("w-full sm:hidden", "100vw", true);

let html = fs.readFileSync("index.html", "utf8");

const oldBlock =
  /<div class="hero-banner-media[^"]*">[\s\S]*?<\/div><\/div><\/div><\/div>/g;

if (oldBlock.test(html)) {
  html = html.replace(oldBlock, "");
}

const gridAnchor =
  '<div class="min-w-0 hero-visual-col"></div>';

const gridReplacement =
  `<div class="min-w-0 hero-visual-col">${DESKTOP}${MOBILE}</div>`;

if (html.includes(gridAnchor)) {
  html = html.replace(gridAnchor, gridReplacement);
} else if (!html.includes("hero-banner-media__frame")) {
  const anchor =
    '<button type="button" class="items-center gap-[0.5em] rounded-md px-[1.25em] py-[0.75em] font-semibold transition-all duration-200 bg-ember-100 text-white hover:bg-ember-200 text-[0.9rem] cursor-pointer mt-2 hidden sm:inline-flex">Réserver une démo</button></div><div class="min-w-0 hero-visual-col">';
  if (html.includes(anchor)) {
    html = html.replace(
      anchor,
      anchor.replace(
        '<div class="min-w-0 hero-visual-col">',
        `<div class="min-w-0 hero-visual-col">${DESKTOP}${MOBILE}`,
      ),
    );
  }
}

fs.writeFileSync("index.html", html);
console.log("index.html — fenêtre app mockup appliqué");
