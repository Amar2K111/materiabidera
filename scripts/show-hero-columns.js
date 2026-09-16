const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
const a = h.indexOf('class="flex flex-col items-start gap-stack-sm"');
const b = h.indexOf("relative mx-auto mt-stack-sm", a);
console.log(h.slice(a - 80, b + 80));
