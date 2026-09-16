import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const oldText =
  "Déjà adopté par plus de 500 entreprises de toutes tailles, dans le monde entier.";

const newLead =
  "Conçu pour les PME BTP qui répondent aux marchés publics et privés.";
const newSub =
  "Du DCE au mémoire technique — analyse, exigences, rédaction, contrôle.";

const oldLogos = `<div class="relative flex flex-wrap items-center justify-center gap-stack-sm px-stack sm:gap-stack"><img src="./materiabtp-assets/images/logos/crit.svg" alt="Crit" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/diot_siaci.svg" alt="Diot Siaci" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/bunzl.svg" alt="Bunzl" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/bechtle.svg" alt="Bechtle" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/roux_tp.svg" alt="Roux TP" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/generix.svg" alt="Generix" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/afpa.svg" alt="AFPA" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/></div>`;

const pill =
  'inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-3 py-1 font-body text-[0.8125rem] font-medium leading-none text-stone-800';

const newBlock = `<p class="relative text-center font-display text-lead text-stone-800 px-stack">${newLead}</p><p class="relative -mt-1 text-center font-body text-body text-stone-700 px-stack">${newSub}</p><div class="relative flex flex-wrap items-center justify-center gap-2 px-stack sm:gap-2.5" aria-label="Documents et étapes du workflow MateriaBTP"><span class="${pill}">RC</span><span class="${pill}">CCTP</span><span class="${pill}">CCAP</span><span class="${pill}">DPGF</span><span aria-hidden="true" class="hidden h-4 w-px bg-stone-300 sm:block"></span><span class="${pill}">Analyse DCE</span><span class="${pill}">Exigences</span><span class="${pill}">Mémoire</span><span class="${pill}">Contrôle</span></div>`;

if (!html.includes(oldText)) {
  throw new Error("Hero trust text not found");
}
if (!html.includes(oldLogos)) {
  throw new Error("Hero logos strip not found");
}

html = html.replace(
  `<p class="relative text-center font-display text-lead text-stone-800 px-stack">${oldText}</p>${oldLogos}`,
  newBlock,
);

// RSC / escaped variants
const rscOldText =
  "Déjà adopté par plus de 500 entreprises de toutes tailles, dans le monde entier.";
html = html.split(rscOldText).join(newLead);

const rscOldSub =
  "de toutes tailles, dans le monde entier.";
html = html.split(rscOldSub).join("");

html = html.split("Déjà adopté par plus de 500 entreprises ").join("");

fs.writeFileSync(htmlPath, html);
console.log("hero trust band replaced with BTP positioning + pills");
