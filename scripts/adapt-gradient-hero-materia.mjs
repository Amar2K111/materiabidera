import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const sectionStart = html.indexOf('<section class="gradient-hero');
const sectionEnd = html.indexOf("</section>", sectionStart);
if (sectionStart < 0 || sectionEnd < 0) {
  console.error("gradient-hero section not found");
  process.exit(1);
}

let section = html.slice(sectionStart, sectionEnd);

const replacements = [
  // Header
  [
    `<h2 class="font-display font-bold text-title-lg text-balance">Une plateforme IA adaptée <span class="block text-stone-600">aux entreprises les plus exigeantes.</span></h2><p class="font-body text-body text-stone-700 leading-[1.45]">Sécurité, fiabilité et intégration native dans votre système d'information.</p>`,
    `<h2 class="font-display font-bold text-title-lg text-balance">Vos appels d'offres BTP, <span class="block text-stone-600">traités avec rigueur et traçabilité.</span></h2><p class="font-body text-body text-stone-700 leading-[1.45]">DCE, mémoire technique et base entreprise : des documents sensibles, isolés et chiffrés.</p>`,
  ],
  ["SOC 2 Type II", "Isolation par entreprise"],
  ["SSO / SAML", "Pas d'entraînement IA"],

  // Tech diagram — desktop + mobile
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

  // Feature cards
  [
    "Tenderbolt s'appuie sur les modèles d'IA les plus puissants du marché, combinés à une technologie propriétaire pour garantir la sécurité et la précision absolue de vos réponses.",
    "MateriaBTP analyse vos pièces de marché et mobilise uniquement les informations présentes dans votre base entreprise — sans inventer certifications, moyens ou références.",
  ],
  ["RAG", "Sources tracées"],
  ["Indexation sémantique", "Exigences liées au DCE"],
  ["Zéro hallucination", "Sans invention de moyens"],
  [
    "Hébergement européen, chiffrement complet, conformité SOC 2.",
    "Hébergement européen, chiffrement complet, isolation par entreprise.",
  ],
  ["Conformité SOC 2", "Contrôle de couverture"],
  ["Accès SSO", "Export Word / PDF"],
  [
    "<h3 class=\"font-display font-bold text-body-lg\">Intégrations</h3>",
    "<h3 class=\"font-display font-bold text-body-lg\">Base entreprise</h3>",
  ],
  [
    "Connectez vos outils : SharePoint, CRM, ERP, Drive...",
    "Centralisez votre base entreprise : références, méthodes, certifications, moyens.",
  ],
  ["SharePoint, Drive, Notion", "Références • Méthodes • CV • QSE"],
  ["CRM & ERP", "Certifications"],
  ["API REST", "Contrôle avant dépôt"],
  [
    "Travaillez en équipe avec des rôles et permissions adaptés à vos besoins métier.",
    "Accès par dossier pour chargés d'affaires, études et direction.",
  ],
];

for (const [from, to] of replacements) {
  section = section.replaceAll(from, to);
}

html = html.slice(0, sectionStart) + section + html.slice(sectionEnd);
fs.writeFileSync("index.html", html);

console.log("gradient-hero adapted to MateriaBTP BTP");
console.log("Application MateriaBTP:", section.includes("Application MateriaBTP"));
console.log("Workflow appels d'offres BTP:", section.includes("Workflow appels d'offres BTP"));
console.log("Tenderbolt remaining:", section.includes("Tenderbolt"));
