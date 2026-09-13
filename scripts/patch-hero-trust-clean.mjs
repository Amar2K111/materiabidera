import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html.replace(
  /<div class="relative flex flex-wrap items-center justify-center gap-stack-sm px-stack sm:gap-stack">[\s\S]*?<\/div>(?=<\/div><\/div><div class="sticky)/,
  "",
);

const caption =
  "Con&#xE7;u pour les PME BTP qui r&#xE9;pondent aux march&#xE9;s publics et priv&#xE9;s.";

const tick =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-check shrink-0 text-primary" aria-hidden="true"><path d="M5 12l5 5l10 -10"></path></svg>';

html = html.replace(
  /<div class="hero-trust-line[^"]*">[\s\S]*?<\/div>|<p class="hero-trust-caption[^"]*">[^<]*<\/p>/,
  `<div class="hero-trust-line relative flex items-center justify-center gap-snug px-stack">${tick}<p class="hero-trust-caption font-display text-lead text-stone-800">${caption}</p></div>`,
);

fs.writeFileSync("index.html", html, "utf8");
console.log("Logos hero supprimes, legende corrigee");
