const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const srcset =
  "./materiabtp-assets/images/_r/hero/dashboard-fr-480.avif 480w, " +
  "./materiabtp-assets/images/_r/hero/dashboard-fr-640.avif 640w, " +
  "./materiabtp-assets/images/_r/hero/dashboard-fr-960.avif 960w, " +
  "./materiabtp-assets/images/_r/hero/dashboard-fr-1440.avif 1440w, " +
  "./materiabtp-assets/images/hero/dashboard-fr.avif 1440w";

const alt =
  "Capture MateriaBTP : tableau de bord de suivi des dossiers appels d'offres";

const heroImgs =
  `<img src="./materiabtp-assets/images/hero/dashboard-fr.avif" srcSet="${srcset}" ` +
  `sizes="(min-width: 640px) 64vw, 1px" alt="${alt}" fetchPriority="high" ` +
  `class="hidden sm:block w-[64vw] max-w-none"/>` +
  `<img src="./materiabtp-assets/images/hero/dashboard-fr.avif" srcSet="${srcset}" ` +
  `sizes="100vw" alt="${alt}" fetchPriority="high" class="w-full sm:hidden"/>`;

const mhRe =
  /<div class="mh-hero hidden sm:block w-\[64vw\] max-w-none"[\s\S]*?<div class="mh-hero mh-hero--mobile w-full sm:hidden"[\s\S]*?<\/div><\/div>/;

if (!mhRe.test(html)) {
  console.error("mh-hero block not found");
  process.exit(1);
}

html = html.replace(mhRe, heroImgs);

const mobileImgEnd =
  html.indexOf('class="w-full sm:hidden"/>') + 'class="w-full sm:hidden"/>'.length;
const nextSection = html.indexOf(
  '<div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">',
  mobileImgEnd,
);
if (nextSection > mobileImgEnd && html.slice(mobileImgEnd, nextSection).includes("mh-")) {
  html = html.slice(0, mobileImgEnd) + html.slice(nextSection);
}

const brokenJoin =
  'class="w-full sm:hidden"/><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';
const fixedJoin =
  'class="w-full sm:hidden"/></div></div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block">';
if (html.includes(brokenJoin)) {
  html = html.replace(brokenJoin, fixedJoin);
}

html = html.replace(
  '<link rel="stylesheet" href="./materiabtp-assets/materia-hero-mockup.css"/>',
  "",
);

const preload =
  '<link rel="preload" as="image" imageSrcSet="./materiabtp-assets/images/_r/hero/dashboard-fr-480.avif 480w, ./materiabtp-assets/images/_r/hero/dashboard-fr-640.avif 640w, ./materiabtp-assets/images/_r/hero/dashboard-fr-960.avif 960w, ./materiabtp-assets/images/_r/hero/dashboard-fr-1440.avif 1440w" fetchPriority="high"/>';

if (!html.includes("dashboard-fr-480.avif")) {
  html = html.replace(
    /<link rel="stylesheet" href="\.\/materiabtp-assets\/materia-brand-alignment\.css"\/>/,
    `<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>${preload}`,
  );
}

fs.writeFileSync(indexPath, html);
console.log("hero restored to dashboard-fr.avif");
