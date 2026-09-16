import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf('<footer class="border-t');
const end = html.indexOf("</footer>", start) + 9;
console.log(html.slice(start, end).replace(/></g, ">\n<"));
