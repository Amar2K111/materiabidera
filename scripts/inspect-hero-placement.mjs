import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const idx = html.indexOf("hero-banner-media");
const start = html.lastIndexOf("<div", idx - 2000);
console.log(html.slice(start, idx + 1800));
