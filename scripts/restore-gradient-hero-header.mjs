import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const headerStart = html.indexOf(
  '<div class="reveal revealed"><div class="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">',
);
const headerEnd = html.indexOf(
  '<div class="reveal revealed"><div class="relative hidden aspect-1196/462 w-full lg:block">',
  headerStart,
);

if (headerStart < 0 || headerEnd < 0) {
  console.error("header block not found", headerStart, headerEnd);
  process.exit(1);
}

let header = html.slice(headerStart, headerEnd);

header = header
  .replace(
    `<h2 class="font-display font-bold text-title-lg text-balance">Vos appels d'offres BTP, <span class="block text-stone-600">traités avec rigueur et traçabilité.</span></h2><p class="font-body text-body text-stone-700 leading-[1.45]">DCE, mémoire technique et base entreprise : des documents sensibles, isolés et chiffrés.</p>`,
    `<h2 class="font-display font-bold text-title-lg text-balance">Une plateforme IA adaptée <span class="block text-stone-600">aux entreprises les plus exigeantes.</span></h2><p class="font-body text-body text-stone-700 leading-[1.45]">Sécurité, fiabilité et intégration native dans votre système d'information.</p>`,
  )
  .replaceAll("Isolation par entreprise", "SOC 2 Type II")
  .replaceAll("Pas d'entraînement IA", "SSO / SAML");

html = html.slice(0, headerStart) + header + html.slice(headerEnd);
fs.writeFileSync("index.html", html);
console.log("gradient-hero header restored");
