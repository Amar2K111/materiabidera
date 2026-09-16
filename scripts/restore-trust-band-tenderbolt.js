const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const lead =
  "Conçu pour les PME BTP qui répondent aux marchés publics et privés.";

const logos = `<div class="relative flex flex-wrap items-center justify-center gap-stack-sm px-stack sm:gap-stack"><img src="./materiabtp-assets/images/logos/crit.svg" alt="Crit" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/diot_siaci.svg" alt="Diot Siaci" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/bunzl.svg" alt="Bunzl" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/bechtle.svg" alt="Bechtle" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/roux_tp.svg" alt="Roux TP" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/generix.svg" alt="Generix" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/><img src="./materiabtp-assets/images/logos/afpa.svg" alt="AFPA" class="block w-auto object-contain opacity-80 h-7 sm:h-9"/></div>`;

const tenderboltBlock = `<p class="relative text-center font-display text-lead text-stone-800 px-stack">${lead}</p>${logos}`;

// Current BTP pills block (may include extra sub paragraph)
const btpStart = html.indexOf(
  '<p class="relative text-center font-display text-lead text-stone-800 px-stack">Conçu pour les PME BTP',
);
if (btpStart < 0) {
  console.log("BTP trust band not found — may already be Tenderbolt format");
  process.exit(0);
}

const btpEnd = html.indexOf("</div></div></div></section>", btpStart);
const pillsClose = html.indexOf(
  'aria-label="Documents et étapes du workflow MateriaBTP"',
  btpStart,
);
if (pillsClose < 0) {
  console.error("pills block not found");
  process.exit(1);
}
const pillsEnd = html.indexOf("</div>", pillsClose) + "</div>".length;

const oldBlock = html.slice(btpStart, pillsEnd);
html = html.replace(oldBlock, tenderboltBlock);
fs.writeFileSync(indexPath, html);
console.log("restored Tenderbolt trust band (logos strip)");
