/**
 * Capture landing feature cards from /captures/* (real MateriaBTP UI).
 * Usage: npm run dev && npm run capture:features
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(ROOT, "materiabtp-assets/images/features/cards");
const R_DIR = path.join(ROOT, "materiabtp-assets/images/_r/features/cards");
const MARKUP_PATH = path.join(
  ROOT,
  "src/components/landing/plumtech/landing-markup.ts",
);

const SHOTS = [
  {
    url: `${BASE}/captures/analyse`,
    master: "analysis-fr.png",
    alts: ["analysis-fr-480.png", "analysis-fr-640.png", "analysis-fr-960.png"],
    widths: [480, 640, 960],
    landingAlt:
      "Capture MateriaBTP : analyse d'un DCE BTP (RC, CCTP, criteres d'attribution)",
    maxWidth: "600px",
  },
  {
    url: `${BASE}/captures/exigences`,
    master: "questionnaire-fr.png",
    alts: [
      "questionnaire-fr-480.png",
      "questionnaire-fr-640.png",
      "questionnaire-fr-960.png",
    ],
    widths: [480, 640, 960],
    landingAlt:
      "Capture MateriaBTP : matrice d'exigences du DCE avec statuts et sources",
    maxWidth: "500px",
  },
  {
    url: `${BASE}/captures/memoire`,
    master: "proposal-fr.png",
    alts: ["proposal-fr-480.png", "proposal-fr-640.png", "proposal-fr-960.png"],
    widths: [480, 640, 960],
    landingAlt:
      "Capture MateriaBTP : redaction du memoire technique avec plan et suggestions IA",
    maxWidth: "450px",
  },
  {
    url: `${BASE}/captures/base-entreprise`,
    master: "knowledge-base-fr.png",
    alts: [
      "knowledge-base-fr-480.png",
      "knowledge-base-fr-640.png",
      "knowledge-base-fr-960.png",
    ],
    widths: [480, 640, 960],
    landingAlt:
      "Capture MateriaBTP : base entreprise (references, equipe, certifications, methodes)",
    maxWidth: "480px",
  },
];

const CAPTURE_CSS = `
  html, body { background: #f5f5f7 !important; }
  nextjs-portal,
  [data-nextjs-dev-tools-button],
  [data-nextjs-dev-tools-menu],
  [data-nextjs-toast] { display: none !important; visibility: hidden !important; }
`;

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

async function hideNextDevOverlay(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll("nextjs-portal, [data-nextjs-dev-overlay]")
      .forEach((el) => el.remove());
  });
}

async function captureScene(url, outPath, width) {
  const { chromium } = await getPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.waitForSelector(".capture-scene", { timeout: 30_000 });
  await page.waitForTimeout(800);
  await hideNextDevOverlay(page);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.locator(".capture-scene").screenshot({ path: outPath });
  await browser.close();
}

function patchLandingMarkup() {
  let markup = fs.readFileSync(MARKUP_PATH, "utf8");

  for (const shot of SHOTS) {
    const base = shot.master.replace(".png", "");
    markup = markup.replaceAll(`${base}.avif`, shot.master);
    for (const alt of shot.alts) {
      markup = markup.replaceAll(alt.replace(".png", ".avif"), alt);
    }
  }

  const altReplacements = [
    [
      /alt="Interface d'analyse d'appel d'offres[^"]*"/,
      `alt="${SHOTS[0].landingAlt}"`,
    ],
    [
      /alt="Interface de questionnaire[^"]*"/,
      `alt="${SHOTS[1].landingAlt}"`,
    ],
    [
      /alt="Interface de r[^"]*daction IA[^"]*"/i,
      `alt="${SHOTS[2].landingAlt}"`,
    ],
  ];

  for (const [re, alt] of altReplacements) {
    markup = markup.replace(re, alt);
  }

  fs.writeFileSync(MARKUP_PATH, markup);
}

async function main() {
  console.log("Capture des ecrans MateriaBTP (UI reelle)…");

  for (const shot of SHOTS) {
    const masterPath = path.join(OUT_DIR, shot.master);
    console.log(`-> ${shot.master}`);
    await captureScene(shot.url, masterPath, 720);

    for (let i = 0; i < shot.widths.length; i++) {
      const altPath = path.join(R_DIR, shot.alts[i]);
      console.log(`  ${shot.alts[i]} (${shot.widths[i]}px)`);
      await captureScene(shot.url, altPath, shot.widths[i]);
    }
  }

  patchLandingMarkup();
  console.log("landing-markup.ts mis a jour (png + alts BTP).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
