import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

// Original Tenderbolt label geometry (inner flex: items-start gap-3, dot mt-2)
const labelStyles = [
  'style="left:2.68%;top:15.8%;width:25.84%;height:24.5%"',
  'style="left:2.68%;top:42.2%;width:25.84%;height:9.8%"',
  'style="left:71.49%;top:47.5%;width:25.84%;height:21.5%"',
  'style="left:71.49%;top:70.6%;width:25.84%;height:11.5%"',
];

const panelStyles = [
  'style="left:1.34%;top:14.52%;width:28.5%;height:26.44%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  'style="left:1.34%;top:40.95%;width:28.5%;height:11.48%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  'style="left:70.15%;top:46.16%;width:28.5%;height:23.4%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  'style="left:70.15%;top:69.56%;width:28.5%;height:13.22%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
];

// Replace any prior label style variants in desktop diagram
const labelStylePattern =
  /(<div class="absolute flex items-center" )style="[^"]*"/g;
let labelIndex = 0;
html = html.replace(labelStylePattern, (match, prefix) => {
  if (labelIndex >= labelStyles.length) return match;
  const next = `${prefix}${labelStyles[labelIndex++]}`;
  return next;
});

// Reset gradient panels (first 4 in diagram block)
const panelPattern =
  /(<div class="absolute" )style="left:(?:1\.34|3\.2|70\.15|71\.8)%;top:[^"]*background-image:linear-gradient\(180deg, rgba\(145, 145, 87, 0\.06\) -39\.35%, rgba\(121, 46, 241, 0\.08\) 175%\)"/g;
let panelIndex = 0;
html = html.replace(panelPattern, (match, prefix) => {
  if (panelIndex >= panelStyles.length) return match;
  const next = `${prefix}${panelStyles[panelIndex++]}`;
  return next;
});

// MateriaBTP copy (desktop + mobile + hydration payload)
const textReplacements = [
  ["Application Tenderbolt", "Application MateriaBTP"],
  [
    "Analyse &amp; Go / No Go, Questionnaires, BPU, Mémoires techniques",
    "DCE → Go/No-Go → Exigences → Mémoire technique",
  ],
  ["Architecture IA &amp; RAG", "Workflow appels d'offres BTP"],
  [
    "LLM • Retrieval Augmented Generation • Vos données d'entreprise",
    "RC • CCTP • CCAP • Base entreprise tracée",
  ],
];

for (const [from, to] of textReplacements) {
  html = html.replaceAll(from, to);
}

// Sync RSC JSON positions so hydration doesn't revert spacing/text
const jsonStyleReplacements = [
  ['"left":"2.68%","top":"14.52%","width":"25.84%","height":"26.44%"', '"left":"2.68%","top":"15.8%","width":"25.84%","height":"24.5%"'],
  ['"left":"2.68%","top":"40.95%","width":"25.84%","height":"11.48%"', '"left":"2.68%","top":"42.2%","width":"25.84%","height":"9.8%"'],
  ['"left":"71.49%","top":"46.16%","width":"25.84%","height":"23.4%"', '"left":"71.49%","top":"47.5%","width":"25.84%","height":"21.5%"'],
  ['"left":"71.49%","top":"69.56%","width":"25.84%","height":"13.22%"', '"left":"71.49%","top":"70.6%","width":"25.84%","height":"11.5%"'],
];

for (const [from, to] of jsonStyleReplacements) {
  html = html.replaceAll(from, to);
}

fs.writeFileSync("index.html", html);
console.log("diagram labels reset to tenderbolt spacing + materia copy");
