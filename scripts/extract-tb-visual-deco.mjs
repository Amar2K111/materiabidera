import fs from "node:fs";

const h = fs.readFileSync("tenderbolt-fr.html", "utf8");
const start = h.indexOf("Une plateforme unique");
const end = h.indexOf("</section>", start);
const chunk = h.slice(start, end);
const articles = [...chunk.matchAll(/<article class="grid[\s\S]*?<\/article>/g)];

articles.forEach((a, i) => {
  const m = a[0].match(
    /<div class="relative isolate flex items-center justify-center overflow-hidden[\s\S]*?(?=<img)/,
  );
  console.log(`\n=== CARD ${i + 1} ===\n${m?.[0] ?? "missing"}`);
});
