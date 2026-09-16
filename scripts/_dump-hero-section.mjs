import fs from "fs";

const file = process.argv[2] ?? "index.html";
const html = fs.readFileSync(file, "utf8");
const needle = '<section class="relative isolate flex flex-col overflow-clip bg-white pt-header';
const i = html.indexOf(needle);
if (i === -1) {
  console.log("not found");
  process.exit(1);
}
console.log(html.slice(i, i + 7000));
