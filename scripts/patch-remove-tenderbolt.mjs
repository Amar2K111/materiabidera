import fs from "fs";

const LINKEDIN =
  "https://www.linkedin.com/company/materiabtp/";

const files = [
  "index.html",
  "materiabtp-assets/materia-brand-alignment.css",
  "materiabtp-assets/hero-banner-media.css",
];

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;

  text = text.replace(
    /https:\/\/www\.linkedin\.com\/company\/tenderbolt-ai\/?/g,
    LINKEDIN,
  );
  text = text.replace(/hero-tenderbolt/g, "hero-materia");

  if (text !== before) {
    fs.writeFileSync(file, text);
    console.log("patched", file);
  }
}

const html = fs.readFileSync("index.html", "utf8");
const leftovers = [
  ...html.matchAll(/tenderbolt/gi),
].map((m) => html.slice(Math.max(0, m.index - 40), m.index + 40));

console.log("tenderbolt left in index.html:", leftovers.length);
for (const s of leftovers.slice(0, 5)) console.log(" ", s.replace(/\n/g, " "));
