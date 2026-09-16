import fs from "fs";

const src = fs.readFileSync("src/components/landing/plumtech/landing-markup.ts", "utf8");
const i = src.indexOf("Ne nous croyez pas");
const start = src.lastIndexOf("<section", i);
const end = src.indexOf("</section>", i) + 10;
console.log(src.slice(start, end));
