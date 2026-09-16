import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html.replace(
  '<div class="min-w-0"><div class="hero-banner-media hidden sm:block">',
  '<div class="min-w-0 hero-visual-col"><div class="hero-banner-media hidden sm:block">',
);

html = html.replace(
  '<p class="relative text-center font-display text-lead text-stone-800 px-stack">Conçu pour les PME BTP',
  '<p class="hero-trust-caption relative text-center font-display text-lead text-stone-800 px-stack">Conçu pour les PME BTP',
);

fs.writeFileSync("index.html", html);
console.log("hero polish applied");
