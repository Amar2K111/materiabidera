const fs = require("fs");

function extractHero(html, label) {
  const start = html.indexOf("min-h-[60vh]");
  if (start < 0) return console.log(label, "no hero");
  const slice = html.slice(start - 300, start + 4000);
  // find trust band
  const trustIdx = slice.indexOf("mt-stack-sm");
  const gridClose = slice.indexOf("sm:grid-cols-2");
  const afterImg = slice.indexOf("w-full sm:hidden");
  console.log("\n===", label, "===");
  console.log("grid opener:", slice.slice(0, 400).replace(/\s+/g, " "));
  if (afterImg > 0) {
    console.log("after mobile img:", slice.slice(afterImg, afterImg + 200).replace(/\s+/g, " "));
  }
  // count div balance in hero chunk
  const heroEnd = html.indexOf("bg-sand-0", start);
  const chunk = html.slice(start - 500, heroEnd > 0 ? heroEnd : start + 8000);
  let depth = 0;
  let min = 0;
  const re = /<\/?div[^>]*>/g;
  let m;
  while ((m = re.exec(chunk))) {
    if (m[0].startsWith("</div")) depth--;
    else depth++;
    min = Math.min(min, depth);
  }
  console.log("div depth end:", depth, "min:", min);
}

extractHero(fs.readFileSync("index.html", "utf8"), "materia");
extractHero(fs.readFileSync("tenderbolt-fr.html", "utf8"), "tenderbolt");
