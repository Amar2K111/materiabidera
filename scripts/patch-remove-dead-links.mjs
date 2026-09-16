import fs from "fs";

const indexPath = "index.html";
let html = fs.readFileSync(indexPath, "utf8");

// --- Header : menus et sélecteur langue sans page ---
html = html.replace(
  /<nav class="hidden items-center gap-3 nav:flex">[\s\S]*?<\/nav>/,
  "",
);

html = html.replace(
  /<div class="relative"><button type="button" class="h-11 nav:h-\[37px\][\s\S]*?>FR<\/button><\/div>/,
  "",
);

html = html.replace(
  /<button type="button" class="flex size-10 cursor-pointer items-center justify-center nav:hidden" aria-label="Open menu">[\s\S]*?<\/button>/,
  "",
);

// --- Cartes features : « En savoir plus » → ouvre la démo Calendly ---
html = html.replace(
  /<a class="(inline-flex items-center gap-\[0\.5em\][^"]*)" href="\/features\/[^"]+">(En savoir plus)/g,
  '<button type="button" class="btn-calendly $1">$2',
);

html = html.replace(
  /(<button type="button" class="btn-calendly inline-flex items-center gap-\[0\.5em\][^"]*">En savoir plus[\s\S]*?<\/svg>)<\/a>/g,
  "$1</button>",
);

// --- Footer simplifié : logo, texte, LinkedIn, copyright ---
const linkedInBlock = html.match(
  /<a href="https:\/\/www\.linkedin\.com\/company\/materiabtp\/"[\s\S]*?<\/a>/,
)?.[0];

if (!linkedInBlock) {
  throw new Error("Bloc LinkedIn introuvable dans le footer");
}

const footerNew = `<footer class="border-t border-navy-10 bg-surface-plum pt-section-sm font-body text-body-plum footer-light"><div class="mx-auto w-full max-w-7xl px-8"><div class="flex flex-col gap-stack sm:flex-row sm:items-start sm:justify-between"><div class="flex max-w-[420px] flex-col items-start gap-stack-sm"><a class="flex shrink-0 items-center gap-3" href="/"><img src="./materiabtp-assets/images/logo-materiabtp-wordmark.png" alt="MateriaBTP" class="h-[32px] w-auto"/></a><p class="text-meta/relaxed text-muted-plum">Assistant IA pour analyser vos DCE et rédiger vos mémoires techniques BTP, avec traçabilité et sans contenu inventé.</p>${linkedInBlock}</div></div><div class="mt-section-sm border-t border-navy-10 py-8"><p class="text-caption text-muted-plum">© <!-- -->2026<!-- --> MateriaBTP</p></div></div></footer>`;

html = html.replace(/<footer class="border-t border-navy-10[\s\S]*?<\/footer>/, footerNew);

// --- Liens internes morts restants (filet de sécurité) ---
const deadHref =
  /^\/(?:features|fr|sectors|solutions|en)(?:\/|$)/;
html = html.replace(/href="(\/[^"#?][^"]*)"/g, (full, path) =>
  deadHref.test(path) ? "" : full,
);

fs.writeFileSync(indexPath, html);

const left = [...html.matchAll(/href="(\/[^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => deadHref.test(p));
console.log("Liens morts restants:", left.length, left);
console.log("Contactez l'équipe:", html.includes("Contactez l"));
console.log("Solutions nav:", html.includes(">Solutions<"));
console.log("Footer colonnes:", html.includes("Secteurs BTP"));
