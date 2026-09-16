import fs from "fs";
import sharp from "sharp";

const htmlPath = "index.html";
const logoPath = "materiabtp-assets/images/logo-materiabtp-wordmark-light.png";
const meta = await sharp(logoPath).metadata();
const displayHeight = 26;
const displayWidth = Math.round((meta.width * displayHeight) / meta.height);

const logoImg = `<img src="./materiabtp-assets/images/logo-materiabtp-wordmark-light.png" alt="MateriaBTP" width="${displayWidth}" height="${displayHeight}" style="height:${displayHeight}px;width:auto;display:block"/>`;

let html = fs.readFileSync(htmlPath, "utf8");
html = html.replace(
  /<img src="\.\/materiabtp-assets\/images\/logo-materiabtp-wordmark-light\.png" alt="MateriaBTP" class="h-\[26px\] w-auto"\/>/g,
  logoImg,
);
html = html.replace(
  /<img src="\.\/materiabtp-assets\/images\/logo-materiabtp-wordmark-light\.png" alt="MateriaBTP" width="\d+" height="\d+" style="height:\d+px;width:auto;display:block"\/>/g,
  logoImg,
);

fs.writeFileSync(htmlPath, html);
console.log("logo img patched", displayWidth, "x", displayHeight);
