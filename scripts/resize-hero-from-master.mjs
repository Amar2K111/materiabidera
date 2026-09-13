import fs from "fs";
import path from "path";
import sharp from "sharp";

const MASTER = "materiabtp-assets/images/hero/dashboard-fr.png";
const R_DIR = "materiabtp-assets/images/_r/hero";
const WIDTHS = [480, 640, 960, 1440];

async function main() {
  if (!fs.existsSync(MASTER)) {
    console.error("Master introuvable:", MASTER);
    process.exit(1);
  }

  fs.mkdirSync(R_DIR, { recursive: true });
  fs.mkdirSync("public/images/hero/_r", { recursive: true });

  for (const w of WIDTHS) {
    const name = `dashboard-fr-${w}.png`;
    const out = path.join(R_DIR, name);
    console.log("->", name);
    await sharp(MASTER).resize({ width: w, withoutEnlargement: true }).png().toFile(out);
    fs.copyFileSync(out, path.join("public/images/hero/_r", name));
  }

  fs.copyFileSync(MASTER, "public/images/hero/dashboard-fr.png");
  console.log("Tailles responsive generees.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
