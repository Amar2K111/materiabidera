import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const oldHeader = `<div class="flex max-w-3xl flex-col gap-tight text-center"><h2 class="font-display font-bold text-title-lg text-balance leading-[1.1]">Ne nous croyez pas sur parole.</h2><p class="font-body text-body text-stone-700 leading-[1.45]">Découvrez comment MateriaBTP transforme leurs réponses aux appels d&#x27;offres</p></div>`;

const newHeader = `<div class="flex max-w-3xl flex-col gap-tight text-center"><h2 class="font-display font-bold text-title-lg text-balance leading-[1.1]">Ne nous croyez pas sur parole. Testez-nous.</h2><p class="font-body text-body text-stone-700 leading-[1.45]">Trois différences concrètes sur votre prochain appel d&#x27;offres BTP.</p></div>`;

const advantageCard = (title, body, tag) =>
  `<div class="flex w-full shrink-0 snap-center justify-center lg:w-auto lg:min-w-76 lg:max-w-100 lg:flex-1"><article class="flex flex-col gap-8 rounded-[22px] bg-white p-3 text-stone-1200 w-full max-w-100"><div class="flex flex-1 flex-col justify-between gap-8 px-5 pb-5 pt-5"><div class="flex flex-col gap-6"><span class="inline-flex w-fit items-center gap-1.5 rounded-full font-body font-medium px-2.5 text-caption leading-[2] bg-lazuli-0 text-lazuli-200">${tag}</span><h3 class="font-display text-title-sm font-bold leading-[1.15] text-stone-1200">${title}</h3><p class="font-body text-body text-stone-800 leading-[1.45]">${body}</p></div></div></article></div>`;

const newCards = `<div class="flex w-full min-w-0 snap-x snap-mandatory gap-stack-sm overflow-x-auto pb-2 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0">${advantageCard(
  "Analyse DCE en quelques minutes",
  "RC, CCTP, CCAP et annexes décortiqués rapidement. Go / No-Go argumenté avec sources — vous tranchez.",
  "Étape 1",
)}${advantageCard(
  "Exigences tracées à la source",
  "Chaque exigence reliée au DCE. Couverture, lacunes et priorités visibles avant de rédiger le mémoire.",
  "Étape 2",
)}${advantageCard(
  "Mémoire technique sans invention",
  "Contenu fondé sur votre base entreprise : références, moyens, méthodes. Contrôle avant export Word ou PDF.",
  "Étape 3",
)}</div>`;

const cardsStart = html.indexOf(
  '<div class="flex w-full min-w-0 snap-x snap-mandatory gap-stack-sm overflow-x-auto pb-2 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0">',
  html.indexOf("Ne nous croyez pas sur parole."),
);
const cardsEnd = html.indexOf(
  '<div class="flex flex-col items-center gap-stack-sm">',
  cardsStart,
);

if (cardsStart === -1 || cardsEnd === -1) {
  throw new Error("Could not locate testimonials cards block");
}

html = html.replace(oldHeader, newHeader);
html = html.slice(0, cardsStart) + newCards + html.slice(cardsEnd);

html = html.replace(
  `<p class="font-display font-bold text-lead text-balance text-center">Soyez le prochain, rejoignez-nous !</p>`,
  `<p class="font-display font-bold text-lead text-balance text-center">Voyez la différence sur votre prochain dossier.</p>`,
);

// RSC / i18n duplicates (skip rendered h2 already updated)
html = html
  .split("Ne nous croyez pas sur parole.</h2>")
  .join("Ne nous croyez pas sur parole. Testez-nous.</h2>")
  .split("Découvrez comment MateriaBTP transforme leurs réponses aux appels d&#x27;offres")
  .join("Trois différences concrètes sur votre prochain appel d&#x27;offres BTP.")
  .split("Découvrez comment MateriaBTP transforme leurs réponses aux appels d'offres")
  .join("Trois différences concrètes sur votre prochain appel d'offres BTP.")
  .split("Soyez le prochain, rejoignez-nous !")
  .join("Voyez la différence sur votre prochain dossier.");

fs.writeFileSync(htmlPath, html);
console.log("social proof section replaced with 3 advantages");
