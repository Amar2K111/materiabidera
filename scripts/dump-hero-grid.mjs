import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const title = html.indexOf("Le logiciel IA de réponse");
console.log(html.slice(title - 1200, title + 4500));
