import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = "materiabtp-assets/images/logo-materiabtp-icon.png";
const PUBLIC = "public";
const APP = "src/app";

/** Recadre le pictogramme (ignore fond noir / transparent). */
async function croppedIconPipeline() {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const isBackground = a < 12 || (r < 24 && g < 24 && b < 24);
      if (!isBackground) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const pad = Math.round(Math.max(contentW, contentH) * 0.08);

  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const extractW = Math.min(width - left, contentW + pad * 2);
  const extractH = Math.min(height - top, contentH + pad * 2);

  return sharp(SRC).extract({ left, top, width: extractW, height: extractH });
}

async function exportIcon(size, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const margin = Math.round(size * 0.04);
  const inner = size - margin * 2;

  const base = await croppedIconPipeline();
  await base
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: margin,
      bottom: margin,
      left: margin,
      right: margin,
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

const icoBase = await croppedIconPipeline();
await icoBase
  .resize(28, 28, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .extend({
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(path.join(PUBLIC, "favicon.ico"));

console.log("Favicon MateriaBTP gùnùrù (recadrù).");
