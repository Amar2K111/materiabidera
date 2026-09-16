#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEST = path.join(ROOT, "exports", "feature-cards");
const ZIP = path.join(ROOT, "exports", "feature-cards-materiabtp.zip");

const FILES = [
  "materiabtp-assets/images/features/cards/analysis-fr.png",
  "materiabtp-assets/images/features/cards/questionnaire-fr.png",
  "materiabtp-assets/images/features/cards/proposal-fr.png",
  "materiabtp-assets/images/features/cards/knowledge-base-fr.png",
  "materiabtp-assets/images/_r/features/cards/analysis-fr-480.png",
  "materiabtp-assets/images/_r/features/cards/analysis-fr-640.png",
  "materiabtp-assets/images/_r/features/cards/analysis-fr-960.png",
  "materiabtp-assets/images/_r/features/cards/questionnaire-fr-480.png",
  "materiabtp-assets/images/_r/features/cards/questionnaire-fr-640.png",
  "materiabtp-assets/images/_r/features/cards/questionnaire-fr-960.png",
  "materiabtp-assets/images/_r/features/cards/proposal-fr-480.png",
  "materiabtp-assets/images/_r/features/cards/proposal-fr-640.png",
  "materiabtp-assets/images/_r/features/cards/proposal-fr-960.png",
  "materiabtp-assets/images/_r/features/cards/knowledge-base-fr-480.png",
  "materiabtp-assets/images/_r/features/cards/knowledge-base-fr-640.png",
  "materiabtp-assets/images/_r/features/cards/knowledge-base-fr-960.png",
];

fs.mkdirSync(DEST, { recursive: true });

for (const rel of FILES) {
  const src = path.join(ROOT, rel);
  const name = path.basename(rel);
  if (!fs.existsSync(src)) {
    console.error("Missing:", rel);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(DEST, name));
  console.log("copied", name, fs.statSync(src).size, "bytes");
}

if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);

if (process.platform === "win32") {
  spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${DEST.replace(/'/g, "''")}/*' -DestinationPath '${ZIP.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "inherit" },
  );
} else {
  spawnSync("zip", ["-j", ZIP, ...FILES.map((f) => path.join(ROOT, f))], {
    stdio: "inherit",
    cwd: ROOT,
  });
}

console.log("\nExport ready:");
console.log(" Folder:", DEST);
console.log(" ZIP:   ", ZIP, `(${fs.statSync(ZIP).size} bytes)`);
