import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = process.argv[2] ?? "pexels-yankrukov-7691690.jpg";
const WIDTHS = [480, 640, 960, 1440];

if (!fs.existsSync(SRC)) {
  console.error(`Source introuvable : ${SRC}`);
  process.exit(1);
}

const master = "materiabtp-assets/images/home/corporate-problems.jpg";
const rDir = "materiabtp-assets/images/_r/home";

fs.mkdirSync(path.dirname(master), { recursive: true });
fs.mkdirSync(rDir, { recursive: true });

async function exportWidth(width, dest) {
  await sharp(SRC)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(dest);
}

for (const w of WIDTHS) {
  const dest =
    w === 1440
      ? master
      : path.join(rDir, `corporate-problems-${w}.jpg`);
  await exportWidth(w, dest);
  console.log("->", dest);
}

console.log("Image corporate-problems installée.");
