import fs from "node:fs";

const tb = fs.readFileSync("tenderbolt-fr.html", "utf8");
const idx = fs.readFileSync("index.html", "utf8");

function extractArticles(html, label) {
  const start = html.indexOf("Une plateforme unique");
  const end = html.indexOf("</section>", start);
  const chunk = html.slice(start, end);
  const articles = [...chunk.matchAll(/<article class="grid[\s\S]*?<\/article>/g)].map(
    (m) => m[0],
  );
  console.log(`\n=== ${label} (${articles.length} cards) ===`);
  articles.forEach((article, i) => {
    const openTag = article.match(/^<article[^>]+>/)?.[0] ?? "";
    console.log(`Card ${i + 1}: article rtl = ${openTag.includes("md:[direction:rtl]")}`);
    console.log(" ", openTag.slice(0, 180));
  });
}

extractArticles(tb, "Tenderbolt");
extractArticles(idx, "MateriaBTP");
