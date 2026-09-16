import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const mainStart = html.indexOf("<main");
const mainEnd = html.indexOf("</main>") + 7;
const main = html.slice(mainStart, mainEnd);
const parts = main.split(/(?=<section)/).filter((p) => p.startsWith("<section"));

console.log("Sections:", parts.length);
parts.forEach((p, i) => {
  const cls = (p.match(/^<section[^>]*>/) || [""])[0];
  console.log(`\n--- section ${i} ---`);
  console.log(cls.slice(0, 120));
  console.log({
    ariaHidden: (p.match(/aria-hidden="true"/g) || []).length,
    shapeSvg: p.includes("shape.svg"),
    wireframe: p.includes("wireframe"),
    gradientShape: p.includes("gradient-shape"),
    lazuli: (p.match(/text-lazuli/g) || []).length,
    sand: (p.match(/text-sand/g) || []).length,
    pointerAbs: (p.match(/pointer-events-none absolute/g) || []).length,
    maskImage: p.includes("mask-image"),
    inset0: (p.match(/absolute inset-0/g) || []).length,
  });
});
