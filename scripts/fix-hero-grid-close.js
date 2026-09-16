const fs = require("fs");
const p = "index.html";
let h = fs.readFileSync(p, "utf8");

const broken =
  'class="w-full sm:hidden"/></div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';
const fixed =
  'class="w-full sm:hidden"/></div></div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';

if (!h.includes(broken)) {
  console.error("pattern not found");
  process.exit(1);
}

h = h.replace(broken, fixed);
fs.writeFileSync(p, h);
console.log("closed hero grid before trust band");
