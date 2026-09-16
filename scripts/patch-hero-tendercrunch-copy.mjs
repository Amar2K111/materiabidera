import fs from "fs";

const path = "src/components/landing/plumtech/landing-markup.ts";
let src = fs.readFileSync(path, "utf8");

const heroIdx = src.indexOf("hero-materia");
if (heroIdx === -1) {
  console.error("hero-materia not found");
  process.exit(1);
}

const colIdx = src.indexOf(
  '<div class=\\"flex flex-col items-start gap-stack-sm\\">',
  heroIdx,
);
const pStart = src.indexOf('<p class=\\"mb-4 inline-flex', colIdx);
const pEnd = src.indexOf("</p>", src.indexOf("MateriaBTP est le logiciel", colIdx)) + 4;
if (pStart === -1 || pEnd <= pStart) {
  console.error("Hero copy block not found");
  process.exit(1);
}

const newBlock =
  '<p class=\\"mb-4 inline-flex items-center gap-2 rounded-full border border-navy-10 bg-surface-plum px-4 py-1.5 text-sm font-medium text-primary\\">' +
  "Nouveau \u00b7 Analyse du DCE et Go/No-Go en quelques minutes " +
  '<span aria-hidden=\\"true\\">\u2192</span></p>' +
  '<h1 class=\\"font-display font-bold text-display text-balance leading-[1.05]\\">' +
  "Remportez plus d&#x27;appels d&#x27;offres. " +
  '<span class=\\"text-stone-700\\">Sans y laisser vos semaines.</span></h1>' +
  '<p class=\\"max-w-xl font-body text-lg leading-relaxed text-stone-700\\">' +
  "MateriaBTP est le logiciel de r\u00e9ponse aux appels d&#x27;offres qui analyse vos DCE, fiabilise vos Go/No-Go et r\u00e9dige vos m\u00e9moires techniques \u00e0 partir de votre savoir-faire&nbsp;: l&#x27;IA produit, vos experts d\u00e9cident." +
  "</p>";

src = src.slice(0, pStart) + newBlock + src.slice(pEnd);
fs.writeFileSync(path, src, "utf8");
console.log("Hero copy fixed (UTF-8).");
