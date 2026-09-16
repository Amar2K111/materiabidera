const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");

const imgEnd = h.indexOf('class="w-full sm:hidden"/>') + 'class="w-full sm:hidden"/>'.length;
const nextSection = h.indexOf(
  '<div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">',
  imgEnd,
);

console.log("orphan length:", nextSection - imgEnd);
console.log(h.slice(imgEnd, nextSection));
