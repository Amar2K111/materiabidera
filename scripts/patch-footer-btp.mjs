import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const workflowOld = `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Workflow</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/rfp">Go / No-Go</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/public-tenders">Marchés Publics</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/bid-management">Base entreprise</a></li></ul></div>`;

const workflowNew = `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Workflow</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/analysis">Analyse DCE</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/#workflow">Go / No-Go</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/questionnaires">Exigences tracées</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/knowledge-base">Base entreprise</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/proposal">Mémoire technique</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/rfq">Contrôle et export</a></li></ul></div>`;

const secteursOld = `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Secteurs BTP</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/software">Entreprises générales</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/services">Travaux publics et TP</a></li></ul></div>`;

const secteursNew = `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Secteurs BTP</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/entreprises-generales">Entreprises générales</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/travaux-publics">Travaux publics et VRD</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/second-oeuvre">Second œuvre et lots TCE</a></li></ul></div>`;

const beforeWorkflow = (html.match(/Marchés Publics/g) ?? []).length;
const beforeSoftware = (html.match(/\/sectors\/software/g) ?? []).length;

html = html.split(workflowOld).join(workflowNew);
html = html.split(secteursOld).join(secteursNew);

// RSC / escaped duplicates (Tenderbolt export)
html = html
  .split('href="/solutions/rfp">Go / No-Go</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/public-tenders">Marchés Publics</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/bid-management">Base entreprise</a>')
  .join('href="/features/analysis">Analyse DCE</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/#workflow">Go / No-Go</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/questionnaires">Exigences tracées</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/knowledge-base">Base entreprise</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/proposal">Mémoire technique</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/rfq">Contrôle et export</a>');

html = html
  .split('href="/sectors/software">Entreprises générales</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/services">Travaux publics et TP</a>')
  .join('href="/sectors/entreprises-generales">Entreprises générales</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/travaux-publics">Travaux publics et VRD</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/second-oeuvre">Second œuvre et lots TCE</a>');

fs.writeFileSync(htmlPath, html);

const afterWorkflow = (html.match(/Marchés Publics/g) ?? []).length;
const afterSoftware = (html.match(/\/sectors\/software/g) ?? []).length;

console.log("Workflow column:", beforeWorkflow, "->", afterWorkflow, "Marchés Publics refs");
console.log("Secteurs column:", beforeSoftware, "->", afterSoftware, "/sectors/software refs");
console.log("Contrôle et export refs:", (html.match(/Contrôle et export/g) ?? []).length);
