#!/usr/bin/env node
/**
 * Capture hero mockup + decos, puis zip pour téléchargement local.
 * Usage: npm run dev puis node scripts/export-hero-mockup-screens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const DEST = path.join(ROOT, "exports", "hero-mockup");
const ZIP = path.join(ROOT, "exports", "hero-mockup-materiabtp.zip");
const DOWNLOADS_ZIP = path.join(
  process.env.USERPROFILE ?? process.env.HOME ?? ROOT,
  "Downloads",
  "hero-mockup-materiabtp.zip",
);

const ASSETS = [
  "materiabtp-assets/images/hero/dashboard-fr.png",
  "materiabtp-assets/images/home/stats-panel.jpg",
  "materiabtp-assets/images/home/faq-panel.jpg",
];

async function getPlaywright() {
  try {
    return await import("playwright");
  } catch {
    spawnSync("npx", ["--yes", "playwright", "install", "chromium"], {
      stdio: "inherit",
      shell: true,
    });
    return import("playwright");
  }
}

async function shot(page, selector, outName, pad = 16) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: "visible", timeout: 20000 });
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const box = await el.boundingBox();
  if (!box) throw new Error(`Pas de bounding box: ${selector}`);
  await page.screenshot({
    path: path.join(DEST, outName),
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
  console.log("capture", outName);
}

async function main() {
  fs.mkdirSync(DEST, { recursive: true });

  for (const rel of ASSETS) {
    const src = path.join(ROOT, rel);
    const name = path.basename(rel);
    if (!fs.existsSync(src)) {
      console.error("Asset manquant:", rel);
      process.exit(1);
    }
    fs.copyFileSync(src, path.join(DEST, name));
    console.log("copied", name);
  }

  const { chromium } = await getPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(`${BASE}/?v=23`, { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-tenderbolt__scene", { timeout: 20000 });

  await shot(page, ".hero-tenderbolt__scene", "hero-mockup-scene-1400.png", 24);
  await shot(
    page,
    ".hero-tenderbolt__mockup--desktop .hero-banner-media__frame",
    "hero-mockup-browser-frame.png",
    12,
  );
  await shot(
    page,
    ".hero-tenderbolt__deco--tl",
    "hero-deco-lazuli-tl.png",
    8,
  );
  await shot(
    page,
    ".hero-tenderbolt__mockup--desktop .hero-tenderbolt__deco--br",
    "hero-deco-stats-panel-br.png",
    8,
  );

  await shot(
    page,
    "section.bg-surface-plum .grid.lg\\:grid-cols-\\[2fr_3fr\\] > div.relative.mx-auto",
    "faq-panel-with-ember-deco.png",
    20,
  );

  await page.locator("text=Les chiffres parlent").scrollIntoViewIfNeeded();
  await shot(
    page,
    "div.rounded-\\[30px\\].bg-stone-100 div.hidden.md\\:block.rounded-xl",
    "stats-calculator-panel.png",
    12,
  );

  await page.screenshot({
    path: path.join(DEST, "hero-section-full-1400.png"),
    fullPage: false,
  });
  console.log("capture hero-section-full-1400.png");

  await browser.close();

  if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);

  const files = fs.readdirSync(DEST).map((f) => path.join(DEST, f));
  if (process.platform === "win32") {
    spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${DEST.replace(/'/g, "''")}\\*' -DestinationPath '${ZIP.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: "inherit" },
    );
    fs.copyFileSync(ZIP, DOWNLOADS_ZIP);
  } else {
    spawnSync("zip", ["-j", ZIP, ...files], { stdio: "inherit", cwd: ROOT });
  }

  console.log("\nZip prêt:");
  console.log(" ", ZIP);
  if (process.platform === "win32") console.log(" ", DOWNLOADS_ZIP);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
