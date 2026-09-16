import fs from "fs";

const src = fs.readFileSync("src/components/landing/plumtech/landing-markup.ts", "utf8");
const i = src.indexOf("hero-materia");
const chunk = src.slice(i, i + 5500);
const colStart = chunk.indexOf('flex flex-col items-start gap-stack-sm');
console.log(chunk.slice(colStart - 20, colStart + 1200));
