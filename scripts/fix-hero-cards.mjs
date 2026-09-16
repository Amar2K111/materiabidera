import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

// Cards were outside max-w-6xl — remove one extra closing div before cards reveal
const broken = `</div></div></div></div><div class="reveal revealed"><div class="flex flex-col gap-6"><div class="grid grid-cols-1 gap-6 md:grid-cols-3">`;
const fixed = `</div></div></div><div class="reveal revealed"><div class="flex flex-col gap-6"><div class="grid grid-cols-1 gap-6 md:grid-cols-3">`;

if (!html.includes(broken)) {
  console.error("structure pattern not found");
  process.exit(1);
}
html = html.replace(broken, fixed);

const cardsStart = html.indexOf(
  '<div class="reveal revealed"><div class="flex flex-col gap-6"><div class="grid grid-cols-1 gap-6 md:grid-cols-3">',
);
const cardsEnd = html.indexOf(
  '<div class="reveal revealed"><div class="overflow-hidden sm:hidden"',
  cardsStart,
);

if (cardsStart < 0 || cardsEnd < 0) {
  console.error("cards block not found", cardsStart, cardsEnd);
  process.exit(1);
}

let cards = html.slice(cardsStart, cardsEnd);

const cardReplacements = [
  [
    "MateriaBTP analyse vos pièces de marché et mobilise uniquement les informations présentes dans votre base entreprise — sans inventer certifications, moyens ou références.",
    "Tenderbolt s'appuie sur les modèles d'IA les plus puissants du marché, combinés à une technologie propriétaire pour garantir la sécurité et la précision absolue de vos réponses.",
  ],
  ["Sources tracées", "RAG"],
  ["Exigences liées au DCE", "Indexation sémantique"],
  ["Sans invention de moyens", "Zéro hallucination"],
  [
    "Hébergement européen, chiffrement complet, isolation par entreprise.",
    "Hébergement européen, chiffrement complet, conformité SOC 2.",
  ],
  ["Contrôle de couverture", "Conformité SOC 2"],
  ["Export Word / PDF", "Accès SSO"],
  [
    "<h3 class=\"font-display font-bold text-body-lg\">Base entreprise</h3>",
    "<h3 class=\"font-display font-bold text-body-lg\">Intégrations</h3>",
  ],
  [
    "Centralisez votre base entreprise : références, méthodes, certifications, moyens.",
    "Connectez vos outils : SharePoint, CRM, ERP, Drive...",
  ],
  ["Références • Méthodes • CV • QSE", "SharePoint, Drive, Notion"],
  ["Certifications", "CRM & ERP"],
  ["Contrôle avant dépôt", "API REST"],
  [
    "Accès par dossier pour chargés d'affaires, études et direction.",
    "Travaillez en équipe avec des rôles et permissions adaptés à vos besoins métier.",
  ],
];

for (const [from, to] of cardReplacements) {
  cards = cards.replaceAll(from, to);
}

html = html.slice(0, cardsStart) + cards + html.slice(cardsEnd);
fs.writeFileSync("index.html", html);

// Verify
const sectionStart = html.indexOf('<section class="gradient-hero');
const sectionEnd = html.indexOf("</section>", sectionStart);
const section = html.slice(sectionStart, sectionEnd);
const containerStart = section.indexOf('<div class="mx-auto flex max-w-6xl flex-col gap-block px-stack">');
let depth = 0;
let containerEnd = -1;
for (let i = containerStart; i < section.length; i++) {
  if (section.slice(i, i + 4) === "<div") depth++;
  if (section.slice(i, i + 6) === "</div>") {
    depth--;
    if (depth === 0) {
      containerEnd = i;
      break;
    }
  }
}
const cardsAt = section.indexOf('<div class="grid grid-cols-1 gap-6 md:grid-cols-3">');
console.log("cards inside max-w-6xl:", cardsAt > containerStart && cardsAt < containerEnd);
console.log("Tenderbolt card text:", html.includes("Tenderbolt s'appuie"));
console.log("Integrations card:", html.includes("SharePoint, Drive, Notion"));
