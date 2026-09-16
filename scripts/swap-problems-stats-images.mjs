import fs from "fs";
import path from "path";
import os from "os";

const pairs = [
  ["materiabtp-assets/images/home/corporate-problems.jpg", "materiabtp-assets/images/home/corporate-stats.jpg"],
  ...[480, 640, 960, 1440].flatMap((w) => [
    [
      `materiabtp-assets/images/_r/home/corporate-problems-${w}.jpg`,
      `materiabtp-assets/images/_r/home/corporate-stats-${w}.jpg`,
    ],
  ]),
];

const tmp = path.join(os.tmpdir(), `materiabtp-swap-${Date.now()}.jpg`);

for (const [a, b] of pairs) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) continue;
  fs.copyFileSync(a, tmp);
  fs.copyFileSync(b, a);
  fs.copyFileSync(tmp, b);
}

fs.rmSync(tmp, { force: true });

let html = fs.readFileSync("index.html", "utf8");

const problemsAlt =
  "Chargé d'affaires BTP au bureau, préparation d'une réponse à appel d'offres";
const statsAlt = "Équipe projet BTP en réunion de travail autour d'un dossier";

html = html.split(problemsAlt).join("__ALT_SWAP_A__");
html = html.split(statsAlt).join(problemsAlt);
html = html.split("__ALT_SWAP_A__").join(statsAlt);

fs.writeFileSync("index.html", html);
console.log("swapped corporate-problems ↔ corporate-stats");
