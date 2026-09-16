const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");

const start = h.indexOf('min-h-[60vh] grid items-center');
const end = h.indexOf('<div class="sticky bottom-0 z-20', start);
const chunk = h.slice(start - 20, end);

let depth = 0;
const re = /<\/?div[^>]*>/g;
let m;
const stack = [];
while ((m = re.exec(chunk))) {
  const isClose = m[0].startsWith("</");
  const snippet = m[0].replace(/\s+/g, " ").slice(0, 70);
  if (!isClose) {
    depth++;
    stack.push({ depth, snippet });
  } else {
    stack.push({ depth, snippet: "CLOSE -> " + (depth - 1) });
    depth--;
  }
}

console.log("depth end:", depth);
console.log("\nopen/close trace around imgs:");
const img = chunk.indexOf("w-full sm:hidden");
const sub = chunk.slice(img - 100, img + 250);
let d2 = 0;
for (const part of sub.split(/(<\/?div[^>]*>)/)) {
  if (part.startsWith("<div")) d2++;
  if (part.startsWith("</div")) d2--;
  if (part.startsWith("<")) console.log(d2, part.slice(0, 60));
  else if (part.trim()) console.log(d2, part.slice(0, 40).replace(/\s+/g, " "));
}
