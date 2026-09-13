/**
 * Capture le tableau de bord reel (/app) pour le mockup hero landing.
 * Usage: npm run dev (autre terminal) puis npm run capture:hero
 */
import fs from "fs";
import path from "path";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const CAPTURE_URL = `${BASE}/captures/hero-dashboard`;
const HERO_DIR = "materiabtp-assets/images/hero";
const R_DIR = "materiabtp-assets/images/_r/hero";
const MASTER = "dashboard-fr.png";
const ALTS = [
  "dashboard-fr-480.png",
  "dashboard-fr-640.png",
  "dashboard-fr-960.png",
  "dashboard-fr-1440.png",
];
const WIDTHS = [480, 640, 960, 1440];
const MASTER_WIDTH = 1120;
const MASTER_HEIGHT = 640;

const CAPTURE_CSS = `
  html, body { background: #f5f5f7 !important; }
  .capture-hero-scene {
    min-height: 0 !important;
    height: ${MASTER_HEIGHT}px !important;
    overflow: hidden !important;
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 20px 48px rgba(0,0,0,.14);
  }
  .app-ui__sidebar {
    display: flex !important;
    width: 220px !important;
    padding: 16px 10px 14px !important;
  }
  .app-ui__header { display: none !important; }
  .app-ui__main-wrap { padding: 18px 22px 16px !important; }
  .app-ui__page-title { font-size: 24px !important; }
  .app-ui__page-lead { font-size: 13px !important; margin-top: 4px !important; }
  .app-ui__metrics .app-ui__metric { padding: 11px 12px !important; }
  .app-ui__metrics .app-ui__metric b { font-size: 22px !important; }
  .app-ui__metrics .app-ui__metric span { font-size: 10.5px !important; }
  .app-ui__card-grid { gap: 10px !important; }
  .app-ui__project-card { padding: 12px !important; }
  .app-ui__project-card h3 { font-size: 13px !important; }
  .app-ui__tag { height: 24px !important; font-size: 10.5px !important; }
  .app-ui__workflow { margin-top: 10px !important; padding: 10px 12px !important; }
  .app-ui__workflow-step { font-size: 10px !important; }
  [role="status"].fixed { display: none !important; }
  nextjs-portal,
  [data-nextjs-dev-tools-button],
  [data-nextjs-dev-tools-menu],
  [data-nextjs-toast] { display: none !important; visibility: hidden !important; }
`;

async function hideNextDevOverlay(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll("nextjs-portal, [data-nextjs-dev-overlay]")
      .forEach((el) => el.remove());
    for (const el of document.querySelectorAll("body *")) {
      const style = getComputedStyle(el);
      if (style.position !== "fixed" && style.position !== "sticky") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width > 80 || rect.height > 80) continue;
      const nearBottom = rect.bottom >= window.innerHeight - 8;
      const nearTop = rect.top <= 8;
      const nearLeft = rect.left <= 80;
      const nearRight = rect.right >= window.innerWidth - 80;
      if ((nearBottom || nearTop) && (nearLeft || nearRight)) {
        el.remove();
      }
    }
  });
}

async function getPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const { spawnSync } = await import("child_process");
    spawnSync("npx", ["--yes", "playwright", "install", "chromium"], {
      stdio: "inherit",
      shell: true,
    });
    return import("playwright");
  }
}

async function captureShell(outPath, width, height) {
  const { chromium } = await getPlaywright();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const demo = await page.request.post(`${BASE}/api/auth/demo`);
  if (!demo.ok()) {
    await browser.close();
    throw new Error(`Session demo impossible (${demo.status()})`);
  }

  await page.goto(CAPTURE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.waitForSelector(".capture-hero-scene", { timeout: 30_000 });
  await page.waitForTimeout(1200);
  await hideNextDevOverlay(page);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.locator(".capture-hero-scene").screenshot({ path: outPath });
  await browser.close();
}

function syncPublicHero() {
  const pubHero = "public/images/hero";
  const pubR = path.join(pubHero, "_r");
  fs.mkdirSync(pubR, { recursive: true });
  fs.copyFileSync(path.join(HERO_DIR, MASTER), path.join(pubHero, MASTER));
  for (const alt of ALTS) {
    fs.copyFileSync(path.join(R_DIR, alt), path.join(pubR, alt));
  }
}

function patchIndexHtml() {
  let html = fs.readFileSync("index.html", "utf8");
  const preload =
    `<link rel="preload" as="image" imageSrcSet="./materiabtp-assets/images/_r/hero/${ALTS[0]} 480w, ./materiabtp-assets/images/_r/hero/${ALTS[1]} 640w, ./materiabtp-assets/images/_r/hero/${ALTS[2]} 960w, ./materiabtp-assets/images/_r/hero/${ALTS[3]} 1440w" fetchPriority="high"/>`;

  html = html.replace(
    /<link rel="preload" as="image" imageSrcSet="\.\/materiabtp-assets\/images\/_r\/hero\/dashboard-fr[^"]+" fetchPriority="high"\/>/,
    preload,
  );

  fs.writeFileSync("index.html", html);
  console.log("index.html hero preload mis a jour");
}

async function main() {
  console.log(`Capture hero marketing : ${CAPTURE_URL}`);

  const masterPath = path.join(HERO_DIR, MASTER);
  console.log(`-> ${MASTER} (${MASTER_WIDTH}x${MASTER_HEIGHT})`);
  await captureShell(masterPath, MASTER_WIDTH, MASTER_HEIGHT);

  for (let i = 0; i < WIDTHS.length; i++) {
    const w = WIDTHS[i];
    const h = Math.max(Math.round(w * (MASTER_HEIGHT / MASTER_WIDTH)), 360);
    const outPath = path.join(R_DIR, ALTS[i]);
    console.log(`  ${ALTS[i]} (${w}x${h})`);
    await captureShell(outPath, w, h);
  }

  syncPublicHero();
  patchIndexHtml();
  console.log("Termine — mockup hero mis a jour avec le dashboard actuel.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
