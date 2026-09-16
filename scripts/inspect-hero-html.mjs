import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const i = html.indexOf("dashboard-fr");
console.log("idx", i);
console.log(html.slice(Math.max(0, i - 1500), i + 800));
