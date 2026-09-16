import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");
html = html.replace(
  /hero-trust-caption[^>]*>[^<]+</,
  'hero-trust-caption relative text-center font-display text-lead text-stone-800 px-stack">Conçu pour les PME BTP qui répondent aux marchés publics et privés.<',
);
fs.writeFileSync("index.html", html);
console.log("Trust caption corrige");
