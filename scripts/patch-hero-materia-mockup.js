const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const fragmentPath = path.join(root, "materiabtp-assets", "hero-mockup.fragment.html");
const cssLink =
  '<link rel="stylesheet" href="./materiabtp-assets/materia-hero-mockup.css"/>';

let html = fs.readFileSync(indexPath, "utf8");
const mockup = fs.readFileSync(fragmentPath, "utf8").trim();

if (!html.includes("materia-hero-mockup.css")) {
  html = html.replace(
    /<link rel="stylesheet" href="\.\/materiabtp-assets\/materia-brand-alignment\.css"\/>/,
    `<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>${cssLink}`,
  );
}

const imgRe =
  /<img src="\.\/materiabtp-assets\/images\/hero\/dashboard-fr\.avif"[\s\S]*?class="hidden sm:block w-\[64vw\] max-w-none"\/><img src="\.\/materiabtp-assets\/images\/hero\/dashboard-fr\.avif"[\s\S]*?class="w-full sm:hidden"\/>/;

const mhRe =
  /<div class="mh-hero hidden sm:block w-\[64vw\] max-w-none"[\s\S]*?<div class="mh-hero mh-hero--mobile w-full sm:hidden"[\s\S]*?<\/div><\/div>/;

if (imgRe.test(html)) {
  html = html.replace(imgRe, mockup);
} else if (mhRe.test(html)) {
  html = html.replace(mhRe, mockup);
} else {
  console.error("hero block not found (neither avif nor mh-hero)");
  process.exit(1);
}

html = html.replace(
  /<link rel="preload" as="image" imageSrcSet="\.\/materiabtp-assets\/images\/_r\/hero\/dashboard-fr[^"]+"[^/]*\/>/g,
  "",
);

fs.writeFileSync(indexPath, html);
console.log("hero mockup MateriaBTP updated (layout Tenderbolt)");
