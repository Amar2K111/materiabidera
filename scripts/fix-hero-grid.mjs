/**
 * Remet le mockup dans la 2e colonne du grid hero (sm:grid-cols-2).
 */
import fs from "fs";

const DESKTOP_RE =
  /<div class="hero-banner-media hidden sm:block">[\s\S]*?<\/div><\/div><\/div><\/div><\/div>/;
const MOBILE_RE =
  /<div class="hero-banner-media hero-banner-media--mobile w-full sm:hidden">[\s\S]*?<\/div><\/div><\/div><\/div><\/div>/;

let html = fs.readFileSync("index.html", "utf8");

const desktop = html.match(DESKTOP_RE)?.[0];
const mobile = html.match(MOBILE_RE)?.[0];
if (!desktop || !mobile) {
  console.error("mockup blocks not found");
  process.exit(1);
}

html = html.replace(DESKTOP_RE, "");
html = html.replace(MOBILE_RE, "");

const anchor =
  '<button type="button" class="items-center gap-[0.5em] rounded-md px-[1.25em] py-[0.75em] font-semibold transition-all duration-200 bg-ember-100 text-white hover:bg-ember-200 text-[0.9rem] cursor-pointer mt-2 hidden sm:inline-flex">Réserver une démo</button></div></div></div>';

const replacement =
  '<button type="button" class="items-center gap-[0.5em] rounded-md px-[1.25em] py-[0.75em] font-semibold transition-all duration-200 bg-ember-100 text-white hover:bg-ember-200 text-[0.9rem] cursor-pointer mt-2 hidden sm:inline-flex">Réserver une démo</button></div><div class="min-w-0 hero-visual-col">' +
  desktop +
  mobile +
  "</div></div></div>";

if (!html.includes(anchor)) {
  console.error("grid anchor not found");
  process.exit(1);
}

html = html.replace(anchor, replacement);

fs.writeFileSync("index.html", html);
console.log("hero mockup placed in grid column 2");
