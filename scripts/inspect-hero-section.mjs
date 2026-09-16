import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const marker = 'section class="relative isolate flex flex-col overflow-clip bg-white pt-header';
const i = html.indexOf(marker);
if (i < 0) {
  console.error("hero section not found");
  process.exit(1);
}
console.log(html.slice(i, i + 1200));
