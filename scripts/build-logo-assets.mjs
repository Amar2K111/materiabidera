import fs from "fs";
import sharp from "sharp";

const wordmarkSrc = "materiabtp-assets/images/logo-materiabtp-wordmark-source.png";

const iconSrc =
  "C:/Users/admin/AppData/Roaming/Cursor/User/workspaceStorage/e7eb732d98fe4aca246374f218b8de94/images/logo design materiabtp-19e99f41-106e-4f6a-aa52-0b9089ae5bc3.png";

/** Remove solid black / near-black background; optionally brighten dark logo parts for dark UI. */
async function buildIconBuffer({ brightenDark = false } = {}) {
  const { data, info } = await sharp(iconSrc)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];

    if (r < 24 && g < 24 && b < 24) {
      out[i + 3] = 0;
      continue;
    }

    if (brightenDark) {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;

      if (max < 90 && sat > 0.15) {
        out[i] = Math.min(255, r + 70);
        out[i + 1] = Math.min(255, g + 90);
        out[i + 2] = Math.min(255, b + 130);
      }
    }
  }

  return { out, info };
}

function fromRaw({ out, info }) {
  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function exportWordmark(src, path, displayHeight = 26) {
  const exportHeight = displayHeight * 2;
  const buf = await sharp(src)
    .ensureAlpha()
    .trim({ threshold: 10 })
    .resize(null, exportHeight, { fit: "inside" })
    .png()
    .toBuffer();
  await sharp(buf).png().toFile(path);
  return sharp(buf).metadata();
}

const base = await buildIconBuffer();
const light = await buildIconBuffer({ brightenDark: true });

const trimmed = await fromRaw(base).png().toBuffer();
await fromRaw(base).png().toFile("materiabtp-assets/images/logo-materiabtp.png");

await fromRaw(base)
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("materiabtp-assets/images/logo-materiabtp-icon.png");

await fromRaw(light)
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("materiabtp-assets/images/logo-materiabtp-icon-light.png");

await fromRaw(light)
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("public/images/materiabtp-icon.png");

await exportWordmark(wordmarkSrc, "materiabtp-assets/images/logo-materiabtp-wordmark.png");
const wordmarkMeta = await exportWordmark(wordmarkSrc, "public/images/materiabtp-logo.png");

// Version blanche / bleu clair pour fonds sombres (header, footer)
await import("./build-wordmark-on-dark.mjs");

const meta = await sharp(trimmed).metadata();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}"><image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${trimmed.toString("base64")}"/></svg>`;
fs.writeFileSync("materiabtp-assets/images/logo-materiabtp.svg", svg);

console.log("wordmark-light", wordmarkMeta.width, "x", wordmarkMeta.height);
console.log(
  "display size",
  Math.round((wordmarkMeta.width * 26) / wordmarkMeta.height),
  "x",
  26,
);
