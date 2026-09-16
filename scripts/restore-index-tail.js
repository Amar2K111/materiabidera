const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const tenderboltPath = path.join(root, "tenderbolt-fr.html");

let index = fs.readFileSync(indexPath, "utf8");
const tenderbolt = fs.readFileSync(tenderboltPath, "utf8");

const calcAnchor =
  "Estimation indicative (~35&nbsp;% de gain sur les phases assistées). Vous gardez la main sur chaque contenu généré.</p></div>";

if (!index.includes(calcAnchor)) {
  console.error("Calculator anchor not found in index.html");
  process.exit(1);
}

// Tenderbolt: from social-proof section through footer (before Next/scripts)
const socialIdx = tenderbolt.indexOf(
  '<h2 class="font-display font-bold text-title-lg text-balance leading-[1.1]">Ne nous croyez pas sur parole.</h2>',
);
if (socialIdx < 0) {
  console.error("Social proof not found in tenderbolt-fr.html");
  process.exit(1);
}

// Walk back to opening <section for social proof block
let sectionStart = tenderbolt.lastIndexOf("<section", socialIdx);
if (sectionStart < 0) {
  console.error("Section start not found");
  process.exit(1);
}

// End before inline Next / Cookiebot scripts (keep static nav from index)
const tailEndMarkers = [
  '<script src="/_next/static/chunks/',
  "<script>self.__next_f",
  '<script src="https://www.googletagmanager.com',
];
let tailEnd = tenderbolt.length;
for (const m of tailEndMarkers) {
  const i = tenderbolt.indexOf(m, sectionStart);
  if (i >= 0) tailEnd = Math.min(tailEnd, i);
}

let tail = tenderbolt.slice(sectionStart, tailEnd);

// Close calculator section wrappers still open in index (5 divs + section chain)
// Tenderbolt calc ends with section close before social — grab that bridge
const calcSectionEnd = tenderbolt.indexOf("<section", socialIdx);
const bridgeStart = tenderbolt.indexOf("Les chiffres parlent");
// From end of tenderbolt stats block to social section
const statsEndInTb = tenderbolt.indexOf("</section>", bridgeStart);
const bridge = tenderbolt.slice(statsEndInTb, sectionStart);

// Materia calc uses different inner markup — only take closing tags from bridge
const closeOnly = bridge.replace(/^[\s\S]*?(<\/div>\s*)+/m, (m) => {
  // keep only trailing closes after last visible content
  return m;
});

// Simpler: count div depth in index after calc anchor
const mainStart = index.indexOf("<main");
const beforeTail = index.slice(mainStart, index.indexOf(calcAnchor) + calcAnchor.length);
let depth = 0;
for (const m of beforeTail.matchAll(/<\/?div[^>]*>/g)) {
  if (m[0].startsWith("</")) depth--;
  else depth++;
}
console.log("open divs to close before tail:", depth);

// Generate closing tags + bridge section end from tenderbolt
// Find in bridge the sequence of </div></section> etc.
const bridgeMatch = bridge.match(/((?:<\/div>\s*)+<\/section>\s*)+/);
const closers = bridgeMatch ? bridgeMatch[0] : "</div>".repeat(depth) + "</section>";

// Asset paths
tail = tail
  .replace(/src="\/images\//g, 'src="./materiabtp-assets/images/')
  .replace(/srcSet="\/images\//g, 'srcSet="./materiabtp-assets/images/')
  .replace(/href="\/images\//g, 'href="./materiabtp-assets/images/')
  .replace(/url\(\/images\//g, "url(./materiabtp-assets/images/")
  .replace(/Tenderbolt/g, "MateriaBTP")
  .replace(/tenderbolt\.ai/g, "materiabtp.ai");

// Remove any Next script tags left in tail
tail = tail.replace(/<script[^>]*src="\/_next[^"]*"[^>]*><\/script>/g, "");
tail = tail.replace(/<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/g, "");

const navBlock = index.slice(index.indexOf('<style id="static-nav-scroll-fix">'));

index =
  index.slice(0, index.indexOf(calcAnchor) + calcAnchor.length) +
  closers +
  tail +
  navBlock;

// Fix duplicate @index.html artifact if present
index = index.replace(/<\/html>@index\.html\s*$/, "</html>");

if (!index.includes("</main>")) {
  console.warn("warning: still no </main>");
}
if (!index.includes("Questions fréquentes")) {
  console.warn("warning: FAQ missing");
}

fs.writeFileSync(indexPath, index);
console.log("restored tail sections");
console.log("Ne nous croyez pas:", index.includes("Ne nous croyez pas"));
console.log("Questions fréquentes:", index.includes("Questions fréquentes"));
console.log("</main>:", index.includes("</main>"));
console.log("new length:", index.length);
