import fs from "fs";
import sharp from "sharp";

const src = "materiabtp-assets/images/logo-materiabtp-wordmark-source.png";
const outputs = [
  "materiabtp-assets/images/logo-materiabtp-wordmark-on-dark.png",
  "materiabtp-assets/images/logo-materiabtp-wordmark-light.png",
  "public/images/materiabtp-logo-light.png",
];

/** Dark navy text → white ; brand blue → lighter blue for dark backgrounds. */
function recolorForDarkBg({ out, info }) {
  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3];
    if (a < 20) continue;

    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    // Dark ink ("Materia") → white
    if (max < 95 && b >= r && sat > 0.08) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      continue;
    }

    // Brand blue (icon + "BTP") → light blue
    if (b > r + 20 && b > 80) {
      out[i] = 91;
      out[i + 1] = 163;
      out[i + 2] = 232; // #5ba3e8
    }
  }

  return { out, info };
}

async function exportOnDark(path, displayHeight = 26) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const out = Buffer.from(data);
  recolorForDarkBg({ out, info });

  const exportHeight = displayHeight * 2;
  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 10 })
    .resize(null, exportHeight, { fit: "inside" })
    .png()
    .toFile(path);
}

for (const path of outputs) {
  await exportOnDark(path);
  console.log("wrote", path);
}
