import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = "materiabtp-assets/images/logo-materiabtp-icon.png";
const PUBLIC = "public";
const APP = "src/app";

async function exportIcon(size, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(SRC)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(dest);
  console.log("->", dest);
}

await exportIcon(16, path.join(PUBLIC, "favicon-16x16.png"));
await exportIcon(32, path.join(PUBLIC, "favicon-32x32.png"));
await exportIcon(180, path.join(PUBLIC, "apple-touch-icon.png"));
await exportIcon(32, path.join(APP, "icon.png"));
await exportIcon(180, path.join(APP, "apple-icon.png"));

// ICO minimal : reprendre le PNG 32px (navigateurs modernes acceptent aussi PNG renommé)
await sharp(SRC)
  .resize(32, 32, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(path.join(PUBLIC, "favicon.ico"));

console.log("Favicon MateriaBTP généré.");
