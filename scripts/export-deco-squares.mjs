#!/usr/bin/env node
/**
 * Exporte les carres decoratifs (lazuli / ember) en PNG + zip.
 * Usage: npm run dev puis node scripts/export-deco-squares.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const DEST = path.join(ROOT, "exports", "deco-squares");
const ZIP = path.join(ROOT, "exports", "deco-squares-materiabtp.zip");
const DOWNLOADS_ZIP = path.join(
  process.env.USERPROFILE ?? process.env.HOME ?? ROOT,
  "Downloads",
  "deco-squares-materiabtp.zip",
);

const COLORS = {
  lazuli: "#3580d4",
  ember: "#3580d4",
  wash: "#eef2fb",
};

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

async function getSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    spawnSync("npm", ["install", "sharp", "--no-save"], {
      stdio: "inherit",
      shell: true,
      cwd: ROOT,
    });
    return (await import("sharp")).default;
  }
}

/** PNG carre uni avec coins arrondis 2.4rem @ 512px */
async function renderSolidSquare(sharp, color, size, outPath) {
  const radius = Math.round(size * (38.4 / 512));
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${color}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log("generated", path.basename(outPath));
}

function labelForDeco(cls) {
  const isLazuli = cls.includes("bg-lazuli-200");
  const isEmber = cls.includes("bg-ember-50");
  const isTl = cls.includes("top-[-4.5%]") || cls.includes("-top-");
  const isBr = cls.includes("right-[-4.5%]") || cls.includes("-right-");
  const color = isLazuli ? "lazuli" : isEmber ? "ember" : "deco";
  const corner = isTl ? "tl" : isBr ? "br" : "square";
  return `${color}-${corner}`;
}

async function captureDecoDivs(page) {
  const locator = page.locator(
    "div.absolute.isolate.aspect-square.overflow-hidden.rounded-\\[2\\.4rem\\]",
  );
  const total = await locator.count();
  let captured = 0;

  for (let i = 0; i < total; i++) {
    const el = locator.nth(i);
    const visible = await el.isVisible().catch(() => false);
    if (!visible) {
      console.warn("skip (hidden):", i + 1);
      continue;
    }
    await el.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(200);

    const meta = await el.evaluate((node) => {
      const r = node.getBoundingClientRect();
      const section = node.closest("section");
      let sectionHint = "section";
      if (section?.className.includes("surface-plum")) sectionHint = "faq";
      else if (node.closest(".hero-tenderbolt")) sectionHint = "hero";
      else if (section?.querySelector(".corporate-problems, .faq-panel-img"))
        sectionHint = "problems";
      return {
        cls: node.className,
        sectionHint,
        w: r.width,
        h: r.height,
      };
    });

    const base = labelForDeco(meta.cls);
    const name = `${meta.sectionHint}-${base}-${i + 1}-capture.png`;

    const box = await el.boundingBox();
    if (!box || box.width < 2 || box.height < 2) {
      console.warn("skip (invisible):", name);
      continue;
    }

    await page.screenshot({
      path: path.join(DEST, name),
      clip: {
        x: Math.max(0, box.x - 4),
        y: Math.max(0, box.y - 4),
        width: box.width + 8,
        height: box.height + 8,
      },
    });
    console.log(
      "capture",
      name,
      `${Math.round(meta.w)}x${Math.round(meta.h)}`,
    );
    captured++;
  }

  if (captured === 0) await captureDecoDivsByDocCoords(page);
  return captured;
}

/** Fallback: coords document (decos partiellement visibles / hors viewport). */
async function captureDecoDivsByDocCoords(page) {
  const items = await page.evaluate(() =>
    [...document.querySelectorAll(
      "div.absolute.isolate.aspect-square.overflow-hidden.rounded-\\[2\\.4rem\\]",
    )].map((node, i) => {
      const r = node.getBoundingClientRect();
      const section = node.closest("section");
      let sectionHint = "section";
      if (section?.className.includes("surface-plum")) sectionHint = "faq";
      return {
        i,
        cls: node.className,
        sectionHint,
        x: r.left + window.scrollX,
        y: r.top + window.scrollY,
        w: r.width,
        h: r.height,
      };
    }).filter((it) => it.w > 2 && it.h > 2),
  );

  for (const item of items) {
    await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 120)), item.y);
    await page.waitForTimeout(300);
    const name = `${item.sectionHint}-${labelForDeco(item.cls)}-${item.i + 1}-doc-capture.png`;
    const scrollY = await page.evaluate(() => window.scrollY);
    const clipY = item.y - scrollY;
    await page.screenshot({
      path: path.join(DEST, name),
      clip: {
        x: Math.max(0, item.x - 4),
        y: Math.max(0, clipY - 4),
        width: item.w + 8,
        height: item.h + 8,
      },
    });
    console.log("capture", name);
  }
}

async function main() {
  fs.mkdirSync(DEST, { recursive: true });

  const sharp = await getSharp();
  for (const [name, hex] of Object.entries(COLORS)) {
    for (const size of [256, 512, 1024]) {
      await renderSolidSquare(
        sharp,
        hex,
        size,
        path.join(DEST, `deco-${name}-rounded-${size}.png`),
      );
    }
  }

  const { chromium } = await getPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(`${BASE}/?v=23`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  let n = await captureDecoDivs(page);

  await page.locator(".corporate-problems, .faq-panel-img").first().scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  n += await captureDecoDivs(page);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shotHeroDecos(page);

  await browser.close();

  if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);
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
  }

  console.log(`\n${n} decos sur la page | Zip:`);
  console.log(" ", ZIP);
  if (process.platform === "win32") console.log(" ", DOWNLOADS_ZIP);
}

async function shotHeroDecos(page) {
  for (const [sel, name] of [
    [".hero-tenderbolt__deco--tl", "hero-lazuli-tl-capture.png"],
    [".hero-tenderbolt__deco--br", "hero-stats-br-capture.png"],
  ]) {
    const el = page.locator(sel).first();
    if (!(await el.count())) continue;
    const box = await el.boundingBox();
    if (!box || box.width < 2) continue;
    await page.screenshot({
      path: path.join(DEST, name),
      clip: {
        x: Math.max(0, box.x - 4),
        y: Math.max(0, box.y - 4),
        width: box.width + 8,
        height: box.height + 8,
      },
    });
    console.log("capture", name);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
