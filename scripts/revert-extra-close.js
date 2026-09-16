const fs = require("fs");
const p = "index.html";
let h = fs.readFileSync(p, "utf8");
h = h.replace(
  'class="w-full sm:hidden"/></div></div><div class="relative mx-auto mt-stack-sm',
  'class="w-full sm:hidden"/></div><div class="relative mx-auto mt-stack-sm',
);
fs.writeFileSync(p, h);
console.log("done");
