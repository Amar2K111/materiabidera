import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const headerBrand =
  '<a class="flex shrink-0 items-center gap-2" href="/"><img src="./materiabtp-assets/images/logo-materiabtp-wordmark-light.png" alt="MateriaBTP" class="h-[26px] w-auto"/></a>';

const footerBrand =
  '<a class="flex shrink-0 items-center gap-3" href="/"><img src="./materiabtp-assets/images/logo-materiabtp-wordmark-light.png" alt="MateriaBTP" class="h-[26px] w-auto"/></a>';

const headerPatterns = [
  /<a class="flex shrink-0 items-center gap-2" href="\/"><img src="\.\/materiabtp-assets\/images\/logo-materiabtp[^"]*" alt="" class="size-8"\/><span class="tracking-normal text-white font-body text-\[22px\] font-semibold leading-\[1\.2\]">MateriaBTP<\/span><\/a>/,
  /<a class="flex shrink-0 items-center gap-2" href="\/"><img src="\.\/materiabtp-assets\/images\/logo-materiabtp[^"]*" alt="" class="size-8"\/><span class="tracking-normal text-white font-body text-\[22px\] font-semibold leading-\[1\.2\]">MateriaBTP<\/span><\/a>/,
];

const footerPatterns = [
  /<a class="flex shrink-0 items-center gap-3" href="\/"><img src="\.\/materiabtp-assets\/images\/logo-materiabtp[^"]*" alt="" class="size-10"\/><span class="tracking-normal text-white font-wide text-3xl font-medium">MateriaBTP<\/span><\/a>/,
];

for (const pattern of headerPatterns) {
  if (pattern.test(html)) {
    html = html.replace(pattern, headerBrand);
    break;
  }
}

for (const pattern of footerPatterns) {
  if (pattern.test(html)) {
    html = html.replace(pattern, footerBrand);
    break;
  }
}

html = html.replace(
  /href="\.\/materiabtp-assets\/images\/logo-materiabtp-icon-light\.png"/g,
  'href="./materiabtp-assets/images/logo-materiabtp-wordmark-light.png"',
);

fs.writeFileSync(htmlPath, html);
console.log("patched index.html brand logos");
