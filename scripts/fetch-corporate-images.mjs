import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

const root = "materiabtp-assets/images";

/** Pexels — usage libre, visuels corporate / BTP cohérents */
const assets = [
  {
    key: "problems",
    pexelsId: 1216589,
    widths: [480, 640, 960, 1440],
  },
  {
    key: "stats",
    pexelsId: 3184418,
    widths: [480, 640, 960, 1440],
  },
  {
    key: "faq",
    pexelsId: 8867432,
    widths: [480, 640, 960],
  },
];

async function download(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  await pipeline(res.body, fs.createWriteStream(dest));
}

for (const asset of assets) {
  for (const w of asset.widths) {
    const url = `https://images.pexels.com/photos/${asset.pexelsId}/pexels-photo-${asset.pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
    const file =
      w === asset.widths.at(-1)
        ? `${root}/home/corporate-${asset.key}.jpg`
        : `${root}/_r/home/corporate-${asset.key}-${w}.jpg`;
    if (fs.existsSync(file)) {
      console.log("skip", file);
      continue;
    }
    console.log("fetch", file);
    await download(url, file);
  }
}

console.log("corporate images ready");
