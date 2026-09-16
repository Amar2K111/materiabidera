import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "hero image.png");
const MASTER = path.join(ROOT, "materiabtp-assets/images/hero/hero-composite.png");
const R_DIR = path.join(ROOT, "materiabtp-assets/images/_r/hero");
const WIDTHS = [480, 640, 960, 1440];

if (!fs.existsSync(SOURCE)) {
  console.error("Fichier introuvable:", SOURCE);
  process.exit(1);
}

fs.mkdirSync(path.dirname(MASTER), { recursive: true });
fs.mkdirSync(R_DIR, { recursive: true });
fs.mkdirSync(path.join(ROOT, "public/images/hero/_r"), { recursive: true });

await sharp(SOURCE).png().toFile(MASTER);
console.log("master ->", MASTER);

for (const w of WIDTHS) {
  const name = `hero-composite-${w}.png`;
  const out = path.join(R_DIR, name);
  await sharp(MASTER).resize({ width: w, withoutEnlargement: true }).png().toFile(out);
  fs.copyFileSync(out, path.join(ROOT, "public/images/hero/_r", name));
  console.log("->", name);
}

fs.copyFileSync(MASTER, path.join(ROOT, "public/images/hero/hero-composite.png"));
console.log("Hero composite installe.");
