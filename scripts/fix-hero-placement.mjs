/**
 * Place le mockup hero dans la colonne droite (sibling du copy), pas dans le texte.
 */
import fs from "fs";

const DESKTOP_RE =
  /<div class="hero-banner-media hidden sm:block">[\s\S]*?<\/div><\/div><\/div><\/div>/;
const MOBILE_RE =
  /<div class="hero-banner-media hero-banner-media--mobile w-full sm:hidden">[\s\S]*?<\/div><\/div><\/div><\/div>/;

let html = fs.readFileSync("index.html", "utf8");

const desktop = html.match(DESKTOP_RE)?.[0];
const mobile = html.match(MOBILE_RE)?.[0];
if (!desktop || !mobile) {
  console.error("mockup blocks not found");
  process.exit(1);
}

html = html.replace(DESKTOP_RE, "");
html = html.replace(MOBILE_RE, "");

const demoBtn =
  '<button type="button" class="items-center gap-[0.5em] rounded-md px-[1.25em] py-[0.75em] font-semibold transition-all duration-200 bg-ember-100 text-white hover:bg-ember-200 text-[0.9rem] cursor-pointer mt-2 hidden sm:inline-flex">Réserver une démo</button>';

if (!html.includes(demoBtn)) {
  console.error("demo button anchor not found");
  process.exit(1);
}

html = html.replace(demoBtn, demoBtn);

const rightColMarker = "</div><div>";
const heroTitleIdx = html.indexOf("Le logiciel IA de réponse");
const afterCopyClose = html.indexOf("</div><div>", heroTitleIdx);
const insertAt = html.indexOf("</div>", afterCopyClose + 10) + 6;

if (insertAt < 10) {
  console.error("right column not found");
  process.exit(1);
}

html = html.slice(0, insertAt) + desktop + mobile + html.slice(insertAt);

fs.writeFileSync("index.html", html);
console.log("hero mockup moved to right column");
