import fs from "fs";

const src = fs.readFileSync("src/components/landing/plumtech/landing-markup.ts", "utf8");
const i = src.indexOf("hero-materia__visual");
console.log(src.slice(i, i + 3500));
