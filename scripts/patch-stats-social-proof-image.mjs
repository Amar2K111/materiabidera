import fs from "node:fs";
import path from "node:path";

const indexPath = path.join(import.meta.dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const alt =
  "Chargé d'affaires BTP au bureau, préparation d'une réponse à appel d'offres";

const desktopImg = `<img src="./materiabtp-assets/images/home/stats-panel.jpg" alt="${alt}" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center stats-panel-img"/>`;

const mobileImg = `<img src="./materiabtp-assets/images/home/stats-panel.jpg" alt="${alt}" fetchPriority="low" class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-center stats-panel-img"/>`;

html = html.replace(/<img[^>]*class="[^"]*stats-panel-img"[^>]*\/>/g, (match, offset) => {
  if (match.includes("inset-x-0") || match.includes("min-h-[20cqi]") || match.includes("w-3/10")) {
    return mobileImg;
  }
  return desktopImg;
});

fs.writeFileSync(indexPath, html);
console.log("Stats panel → stats-panel.jpg", html.includes("stats-panel.jpg"));
