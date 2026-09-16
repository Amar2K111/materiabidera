const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

const patterns = [
  "shape.svg",
  "wireframe-materia",
  "wireframe-arrow",
  "gradient-shape",
  "bg-size-[100%_100%]",
  "clip-path",
  '<svg aria-hidden',
  "stroke-width",
  "fill=\"currentColor\"",
  "bg-lazuli-200",
];

for (const p of patterns) {
  let idx = 0;
  let count = 0;
  while ((idx = html.indexOf(p, idx)) !== -1) {
    count++;
    idx += p.length;
  }
  console.log(`${p}: ${count}`);
}

// Sample first inline decorative svg context
const svgIdx = html.indexOf('<svg aria-hidden="true"');
if (svgIdx >= 0) {
  console.log("\n--- first aria-hidden svg snippet ---");
  console.log(html.slice(svgIdx, svgIdx + 600));
}
