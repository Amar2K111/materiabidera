/**
 * Hero style — fenêtre app inclinée + capture centrée + fondu bas.
 */
import fs from "fs";
import { spawnSync } from "child_process";

const CSS_LINK =
  '<link rel="stylesheet" href="./materiabtp-assets/hero-banner-media.css"/>';

let html = fs.readFileSync("index.html", "utf8");

if (!html.includes("hero-banner-media.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>',
    `<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>${CSS_LINK}`,
  );
  fs.writeFileSync("index.html", html);
}

spawnSync("node", ["scripts/patch-hero-window-mockup.mjs"], {
  stdio: "inherit",
  shell: true,
});
