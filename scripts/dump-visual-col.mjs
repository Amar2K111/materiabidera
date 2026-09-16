import fs from "fs";
const h = fs.readFileSync("index.html", "utf8");
const i = h.indexOf("hero-visual-col");
console.log(h.slice(i - 400, i + 600));
