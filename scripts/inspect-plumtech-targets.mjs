import fs from "node:fs";

const h = fs.readFileSync("index.html", "utf8");

for (const k of [
  "bg-stone-1200",
  "bg-lazuli-200",
  "shape.svg",
  "bg-stone-1100",
  "Vos équipes",
]) {
  let i = 0;
  let c = 0;
  while ((i = h.indexOf(k, i)) !== -1) {
    c++;
    i++;
  }
  console.log(k, c);
}

const i = h.indexOf("article.grid overflow-hidden rounded-xl");
console.log("\nARTICLE:\n", h.slice(i, i + 900));
