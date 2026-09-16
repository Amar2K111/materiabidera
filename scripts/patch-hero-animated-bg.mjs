#!/usr/bin/env node
/**
 * Injecte le fond animé WebGL du hero (style PlumTech) dans index.html.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const INDEX = path.join(ROOT, "index.html");

const HERO_MARKER = "<!-- MATERIABTP:HERO-BG:START -->";
const HERO_BLOCK = `<!-- MATERIABTP:HERO-BG:START -->
<div class="materia-hero-bg-layer" aria-hidden="true" style="position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden">
<canvas class="materia-hero-bg" style="position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none"></canvas>
<div class="materia-hero-bg-fade" style="position:absolute;left:0;right:0;bottom:0;height:6rem;pointer-events:none;background:linear-gradient(to bottom,transparent,#fff)"></div>
</div>
<!-- MATERIABTP:HERO-BG:END -->`;

const CSS_LINK =
  '<link rel="stylesheet" href="./materiabtp-assets/materia-hero-animated-bg.css?v=3"/>';
const JS_SCRIPT =
  '<script src="./materiabtp-assets/materia-hero-animated-bg.js?v=3" defer></script>';

const SECTION_OPEN =
  'section class="relative isolate flex flex-col overflow-clip bg-white pt-header text-stone-1200 sm:justify-center">';
const SECTION_OPEN_PATCHED =
  'section class="hero-animated-bg relative isolate flex flex-col overflow-clip bg-white pt-header text-stone-1200 sm:justify-center">';

let html = fs.readFileSync(INDEX, "utf8");

if (html.includes(HERO_MARKER)) {
  html = html.replace(
    /<!-- MATERIABTP:HERO-BG:START -->[\s\S]*?<!-- MATERIABTP:HERO-BG:END -->/,
    HERO_BLOCK,
  );
} else if (html.includes(SECTION_OPEN)) {
  html = html.replace(SECTION_OPEN, `${SECTION_OPEN_PATCHED}${HERO_BLOCK}`);
} else if (html.includes(SECTION_OPEN_PATCHED)) {
  const patchedWithBg = `${SECTION_OPEN_PATCHED}${HERO_BLOCK}`;
  if (!html.includes(patchedWithBg.slice(0, 80))) {
    html = html.replace(SECTION_OPEN_PATCHED, `${SECTION_OPEN_PATCHED}${HERO_BLOCK}`);
  }
} else {
  console.error("Hero section opening not found");
  process.exit(1);
}

html = html.replace(
  /<link rel="stylesheet" href="\.\/materiabtp-assets\/materia-hero-animated-bg\.css(?:\?v=\d+)?"\/>/,
  CSS_LINK,
);
if (!html.includes("materia-hero-animated-bg.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="./materiabtp-assets/hero-banner-media.css"/>',
    `<link rel="stylesheet" href="./materiabtp-assets/hero-banner-media.css"/>${CSS_LINK}`,
  );
}

html = html.replace(
  '<link rel="stylesheet" href="./materiabtp-assets/materia-plumtech-theme.css"/>',
  '<link rel="stylesheet" href="./materiabtp-assets/materia-plumtech-theme.css?v=2"/>',
);

if (!html.includes("materia-hero-animated-bg.js")) {
  html = html.replace(
    "</body>",
    `${JS_SCRIPT}</body>`,
  );
}

fs.writeFileSync(INDEX, html);
console.log("Hero animated background patched");
