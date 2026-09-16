const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const broken =
  'class="w-full sm:hidden"/><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';
const fixed =
  'class="w-full sm:hidden"/></div></div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';

if (!html.includes(broken)) {
  console.error("pattern not found — hero divs may already be fixed");
  process.exit(1);
}

html = html.replace(broken, fixed);
fs.writeFileSync(indexPath, html);
console.log("inserted missing </div></div> after hero images");
