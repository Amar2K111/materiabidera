import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf(
  'section class="relative isolate flex flex-col overflow-clip bg-white pt-header',
);
if (start < 0) {
  console.error("hero not found");
  process.exit(1);
}

let depth = 0;
let i = start;
const open = html.indexOf(">", start) + 1;
depth = 1;
i = open;
while (depth > 0 && i < html.length) {
  const nextOpen = html.indexOf("<section", i);
  const nextClose = html.indexOf("</section>", i);
  if (nextClose < 0) break;
  if (nextOpen >= 0 && nextOpen < nextClose) {
    depth++;
    i = nextOpen + 8;
  } else {
    depth--;
    if (depth === 0) {
      console.log(html.slice(start, nextClose + 10));
      console.log("\n--- LENGTH:", nextClose + 10 - start);
      break;
    }
    i = nextClose + 10;
  }
}
