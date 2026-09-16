const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");

const gridMarker = 'sm:grid-cols-2"><div class="pointer-events-none';
const gridStart = h.indexOf(gridMarker);
if (gridStart < 0) {
  console.error("grid not found");
  process.exit(1);
}

// From grid open to end of first hero section
const sectionEnd = h.indexOf("</section>", gridStart);
const chunk = h.slice(gridStart - 5, sectionEnd);

let depth = 0;
const events = [];
const re = /<\/?div[^>]*>/g;
let m;
while ((m = re.exec(chunk))) {
  const isClose = m[0].startsWith("</");
  if (!isClose) depth++;
  else depth--;
  if (events.length < 30 || depth <= 2) {
    events.push({ depth, tag: m[0].slice(0, 80), pos: m.index });
  }
}

console.log("final depth in chunk:", depth);
console.log("last events:");
events.slice(-15).forEach((e) => console.log(e.depth, e.tag));

// Find img and what comes after
const imgPos = chunk.indexOf("hidden sm:block");
console.log("\nafter imgs snippet:");
console.log(chunk.slice(imgPos, imgPos + 300));
