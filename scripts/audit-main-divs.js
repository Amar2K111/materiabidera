const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
const start = h.indexOf("<main");
const end = h.indexOf("</main>", start);
const chunk = h.slice(start, end + 7);
let depth = 0;
const re = /<\/?main|<\/?div[^>]*>/g;
let m;
while ((m = re.exec(chunk))) {
  if (m[0].startsWith("</")) depth--;
  else depth++;
}
console.log("main div depth end:", depth);
