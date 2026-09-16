import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const i = html.indexOf("hero-banner-media");
console.log(html.slice(Math.max(0, i - 800), i + 1200));
