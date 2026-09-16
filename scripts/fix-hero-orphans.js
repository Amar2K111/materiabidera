const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const mobileImgEnd =
  html.indexOf('class="w-full sm:hidden"/>') + 'class="w-full sm:hidden"/>'.length;
const nextSection = html.indexOf(
  '<div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">',
  mobileImgEnd,
);

if (mobileImgEnd < 50 || nextSection < 0) {
  console.error("hero markers not found", mobileImgEnd, nextSection);
  process.exit(1);
}

const orphan = html.slice(mobileImgEnd, nextSection);
if (!orphan.includes("mh-")) {
  console.log("no mh orphans found");
  process.exit(0);
}

const broken =
  'class="w-full sm:hidden"/><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';
const fixed =
  'class="w-full sm:hidden"/></div></div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';

if (html.includes(broken)) {
  html = html.replace(broken, fixed);
} else {
  html = html.slice(0, mobileImgEnd) + html.slice(nextSection);
}
html = html.replace(
  '<link rel="stylesheet" href="./materiabtp-assets/materia-hero-mockup.css"/>',
  "",
);

fs.writeFileSync(indexPath, html);
console.log("removed", orphan.length, "chars of orphaned mh HTML");
