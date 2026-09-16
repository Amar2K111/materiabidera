import fs from "node:fs";

function extractImg(html, label, cardIndex) {
  const start = html.indexOf("Une plateforme unique");
  const end = html.indexOf("</section>", start);
  const chunk = html.slice(start, end);
  const articles = [...chunk.matchAll(/<article class="grid[\s\S]*?<\/article>/g)].map((m) => m[0]);
  const article = articles[cardIndex];
  const img = article.match(/<img[^>]+features\/cards[^>]+>/)?.[0] ?? "no img";
  const visual = article.match(
    /<div class="relative isolate flex items-center justify-center overflow-hidden[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/,
  )?.[0]?.slice(0, 600);
  console.log(`\n=== ${label} card ${cardIndex + 1} ===`);
  console.log("IMG:", img.slice(0, 500));
  console.log("VISUAL:", visual?.slice(0, 500));
}

const tb = fs.readFileSync("tenderbolt-fr.html", "utf8");
const idx = fs.readFileSync("index.html", "utf8");
for (let i = 0; i < 4; i++) {
  extractImg(tb, "Tenderbolt", i);
  extractImg(idx, "MateriaBTP", i);
}
