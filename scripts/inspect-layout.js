const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");

const heroStart = h.indexOf('class="relative isolate flex flex-col overflow-clip bg-white pt-header');
const heroEnd = h.indexOf("</section>", heroStart);
const hero = h.slice(heroStart, heroEnd);

console.log("hero section length:", hero.length);

// Count div balance in hero section
let depth = 0;
let minDepth = 0;
for (let i = 0; i < hero.length; i++) {
  if (hero.slice(i, i + 4) === "<div") depth++;
  if (hero.slice(i, i + 6) === "</div>") depth--;
  if (depth < minDepth) minDepth = depth;
}
console.log("div depth at end:", depth, "min:", minDepth);

const imgArea = h.indexOf("hidden sm:block w-[64vw]");
console.log("\n--- after mobile img ---");
const mobileEnd =
  h.indexOf('class="w-full sm:hidden"/>') + 'class="w-full sm:hidden"/>'.length;
console.log(h.slice(mobileEnd, mobileEnd + 200));

// Check for overflow classes
for (const pat of ["64vw", "50vw", "overflow", "w-\\[64vw\\]"]) {
  const re = new RegExp(pat, "g");
  console.log(pat, ":", (h.match(re) || []).length);
}
