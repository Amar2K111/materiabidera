import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");
let changes = [];

function patch(label, oldStr, newStr) {
  if (!html.includes(oldStr)) {
    console.warn(`SKIP (${label}): anchor not found`);
    return false;
  }
  html = html.split(oldStr).join(newStr);
  changes.push(label);
  return true;
}

// 1. Social proof: stray "<" from malformed tag
patch(
  "social-proof <<div",
  "</p><<div class=\"flex w-full min-w-0 snap-x",
  "</p></div><div class=\"flex w-full min-w-0 snap-x",
);

// 2. Footer logo: wordmark only, no text
patch(
  "footer logo",
  '<a class="flex shrink-0 items-center gap-3" href="/fr"><img src="./materiabtp-assets/images/logo-tenderbolt.svg" alt="" class="size-10"/><span class="tracking-normal text-white font-wide text-3xl font-medium">MateriaBTP</span></a>',
  '<a class="flex shrink-0 items-center gap-3" href="/"><img src="./materiabtp-assets/images/logo-materiabtp-wordmark-on-dark.png" alt="MateriaBTP" class="h-[32px] w-auto"/></a>',
);

// 3. Footer tagline BTP
patch(
  "footer tagline",
  "Le logiciel de réponse aux appels d&#x27;offre et RFP basé sur l&#x27;intelligence artificielle",
  "Assistant IA pour analyser vos DCE et rédiger vos mémoires techniques BTP, avec traçabilité et sans contenu inventé.",
);

// 4. Footer Solutions column → BTP
patch(
  "footer solutions",
  `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Solutions</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/features/analysis">Analyse des documents</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/features/questionnaires">Réponse aux questionnaires</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/features/proposal">Rédaction de la proposition</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/features/rfq">RFQ</a></li></ul></div>`,
  `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Solutions</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/analysis">Analyse DCE</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/#workflow">Go / No-Go</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/questionnaires">Exigences tracées</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/knowledge-base">Base entreprise</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/proposal">Mémoire technique</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/rfq">Contrôle et export</a></li></ul></div>`,
);

// 5. Footer Workflow column (was Par appel d'offres)
patch(
  "footer workflow",
  `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Par appel d&#x27;offres</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/solutions/rfp">RFI - RFP</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/solutions/public-tenders">Marchés Publics</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/solutions/bid-management">Bid Management</a></li></ul></div>`,
  `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Workflow</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/public-tenders">Marchés publics</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/rfp">Marchés privés</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/solutions/bid-management">DCE multi-lots</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/features/analysis">RC, CCTP, CCAP</a></li></ul></div>`,
);

// 6. Footer Secteurs BTP
patch(
  "footer secteurs",
  `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Secteurs</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/sectors/software">Editeurs de logiciels</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/fr/sectors/services">Services aux entreprises</a></li></ul></div>`,
  `<div><h3 class="mb-stack-sm font-display text-body font-bold text-white">Secteurs BTP</h3><ul class="flex flex-col gap-2.5"><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/entreprises-generales">Entreprises générales</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/travaux-publics">Travaux publics et VRD</a></li><li><a class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white" href="/sectors/second-oeuvre">Second œuvre et lots TCE</a></li></ul></div>`,
);

// 7. CTA: white text visible on lazuli (remove white card bg)
patch(
  "cta card bg",
  'shadow-[0_4px_24px_0_#10082226] bg-white"><div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden h-[round(up,100%,50rem)]"><svg aria-hidden="true" class="pointer-events-none absolute overflow-visible text-lazuli-200 -translate-x-180',
  'shadow-[0_4px_24px_0_#10082226] bg-lazuli-200 text-white"><div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden h-[round(up,100%,50rem)]"><svg aria-hidden="true" class="pointer-events-none absolute overflow-visible text-white/10 -translate-x-180',
);

patch(
  "cta h2 white",
  '<h2 class="font-display font-medium text-title-lg/tight text-stone-1200">Pendant que vos concurrents répondent, vous gagnez. <span class="text-stone-900">N&#x27;attendez plus.</span></h2><p class="font-body text-body leading-[1.45] text-stone-800">Réservez une démo. Voyez votre premier appel d&#x27;offres traité en 30 minutes avec MateriaBTP.</p>',
  '<h2 class="font-display font-medium text-title-lg/tight text-white">Pendant que vos concurrents répondent, vous gagnez. <span class="text-white/90">N&#x27;attendez plus.</span></h2><p class="font-body text-body leading-[1.45] text-white/85">Réservez une démo. Voyez votre premier appel d&#x27;offres traité en 30 minutes avec MateriaBTP.</p>',
);

// 8. Calculator: desktop image column (Tenderbolt layout)
const calcImageCol = `<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch"><img src="./materiabtp-assets/images/home/corporate-stats.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-stats-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-stats-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-stats-960.jpg 960w, ./materiabtp-assets/images/home/corporate-stats.jpg 1440w" sizes="(min-width: 768px) 50vw, 1px" alt="Chargé d'affaires BTP au bureau, préparation d'une réponse à appel d'offres" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center"/></div>`;

patch(
  "calc desktop image",
  "Vous gardez la main sur chaque contenu généré.</p></div></div></div></div></div></div></section><section class=\"relative isolate overflow-clip bg-stone-1200",
  `Vous gardez la main sur chaque contenu généré.</p></div></div>${calcImageCol}</div></div></div></div></section><section class="relative isolate overflow-clip bg-stone-1200`,
);

// 9. Calculator: cleaner shell styling
html = html.replace(
  /#materia-roi-calc \.mc-shell\{display:flex;flex-direction:column;gap:1rem;padding:1rem;border:1px solid var\(--mc-line\);border-radius:18px;background:linear-gradient\(180deg,#fff 0%,var\(--mc-surface\) 100%\);box-shadow:0 1px 0 rgba\(255,255,255,\.8\) inset,0 8px 24px rgba\(28,25,23,\.06\)\}/,
  "#materia-roi-calc .mc-shell{display:flex;flex-direction:column;gap:.875rem;padding:0;border:none;border-radius:0;background:transparent;box-shadow:none}",
);
if (html.includes("mc-shell{display:flex;flex-direction:column;gap:.875rem;padding:0")) {
  changes.push("calc shell épuré");
}

// Hide redundant mc-intro when subtitle already present
html = html.replace(
  /<p class="mc-intro">Ajustez votre volume de dossiers et le temps passé du DCE au mémoire technique\. MateriaBTP estime le gain de temps récupérable par votre équipe\.<\/p>/,
  "",
);
if (!html.includes("mc-intro")) {
  changes.push("calc intro removed");
}

// Simplify outer stats card padding
patch(
  "calc outer padding",
  "rounded-[30px] bg-dark-orange-100 p-5",
  "rounded-[30px] bg-dark-orange-100 p-3 md:p-4",
);

fs.writeFileSync(htmlPath, html);

console.log("Applied:", changes.length ? changes.join(", ") : "none");
console.log("Checks:");
console.log("  <<div:", html.includes("<<div") ? "FAIL" : "ok");
console.log("  logo-tenderbolt:", html.includes("logo-tenderbolt") ? "still present" : "ok");
console.log("  RFI - RFP:", html.includes("RFI - RFP") ? "still present" : "ok");
console.log("  calc desktop img:", html.includes("md:block md:flex-1 md:basis-0 md:self-stretch") ? "ok" : "missing");
console.log("  CTA text-white:", html.includes("text-title-lg/tight text-white\">Pendant") ? "ok" : "missing");
