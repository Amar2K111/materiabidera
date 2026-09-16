import fs from "fs";
import path from "path";

const assetsDir =
  "C:/Users/admin/.cursor/projects/c-Users-admin-Downloads-BIDERA-GOOD/assets";

const sources = [
  {
    key: "faq",
    file: "c__Users_admin_AppData_Roaming_Cursor_User_workspaceStorage_e7eb732d98fe4aca246374f218b8de94_images_startupstockphotos-typing-849806_1920-43f5ef3e-9249-4687-b2b5-9a9cedc9bc30.jpg",
  },
  {
    key: "problems",
    file: "c__Users_admin_AppData_Roaming_Cursor_User_workspaceStorage_e7eb732d98fe4aca246374f218b8de94_images_tim-van-der-kuip-CPs2X8JYmS8-unsplash-debe2774-1ade-4741-bcb3-76dc5f743cfd.jpg",
  },
  {
    key: "stats",
    file: "c__Users_admin_AppData_Roaming_Cursor_User_workspaceStorage_e7eb732d98fe4aca246374f218b8de94_images_annie-spratt-QckxruozjRg-unsplash-6bcdb547-c4cf-4eab-a4f1-483d5fd5a3ad.jpg",
  },
];

const widths = {
  problems: [480, 640, 960, 1440],
  stats: [480, 640, 960, 1440],
  faq: [480, 640, 960],
};

for (const { key, file } of sources) {
  const src = path.join(assetsDir, file);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing user image: ${src}`);
  }
  const master = `materiabtp-assets/images/home/corporate-${key}.jpg`;
  fs.mkdirSync(path.dirname(master), { recursive: true });
  fs.copyFileSync(src, master);
  for (const w of widths[key]) {
    const dest = `materiabtp-assets/images/_r/home/corporate-${key}-${w}.jpg`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  console.log("installed", key);
}

let html = fs.readFileSync("index.html", "utf8");

const problemsImg = `<img src="./materiabtp-assets/images/home/corporate-problems.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-problems-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-problems-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-problems-960.jpg 960w, ./materiabtp-assets/images/home/corporate-problems.jpg 1440w" sizes="(min-width: 1024px) 40rem, min(80vw, 26rem)" alt="Chargé d'affaires BTP au bureau, préparation d'une réponse à appel d'offres" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center"/>`;

const statsImgDesktop = `<img src="./materiabtp-assets/images/home/corporate-stats.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-stats-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-stats-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-stats-960.jpg 960w, ./materiabtp-assets/images/home/corporate-stats.jpg 1440w" sizes="(min-width: 768px) 30rem, 1px" alt="Équipe projet BTP en réunion de travail autour d'un dossier" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center"/>`;

const statsImgMobile = `<img src="./materiabtp-assets/images/home/corporate-stats.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-stats-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-stats-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-stats-960.jpg 960w, ./materiabtp-assets/images/home/corporate-stats.jpg 1440w" sizes="(min-width: 768px) 1px, 30vw" alt="Équipe projet BTP en réunion de travail autour d'un dossier" fetchPriority="low" class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-center"/>`;

const faqImg = `<img src="./materiabtp-assets/images/home/corporate-faq.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-faq-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-faq-640.jpg 640w, ./materiabtp-assets/images/home/corporate-faq.jpg 960w" sizes="(min-width: 1024px) 24rem, min(100vw, 28rem)" alt="Responsable AO relisant le DCE et le mémoire technique avant remise" width="505" height="542" class="relative w-full rounded-3xl object-cover object-center"/>`;

function swapImg(fromStart, toTag) {
  const start = html.indexOf(fromStart);
  if (start === -1) return false;
  const end = html.indexOf("/>", start) + 2;
  html = html.slice(0, start) + toTag + html.slice(end);
  return true;
}

const targets = [
  [
    '<img src="./materiabtp-assets/images/features/cards/analysis-fr.avif"',
    problemsImg,
    "problems (analysis-fr)",
  ],
  [
    '<img src="./materiabtp-assets/images/home/corporate-problems.jpg"',
    problemsImg,
    "problems (corporate)",
  ],
  [
    '<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden"><img src="./materiabtp-assets/images/hero/dashboard-fr.avif"',
    `<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden">${statsImgMobile}`,
    "stats mobile (dashboard)",
  ],
  [
    '<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden"><img src="./materiabtp-assets/images/home/corporate-stats.jpg"',
    `<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden">${statsImgMobile}`,
    "stats mobile (corporate)",
  ],
  [
    '<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch"><img src="./materiabtp-assets/images/hero/dashboard-fr.avif"',
    `<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch">${statsImgDesktop}`,
    "stats desktop (dashboard)",
  ],
  [
    '<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch"><img src="./materiabtp-assets/images/home/corporate-stats.jpg"',
    `<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch">${statsImgDesktop}`,
    "stats desktop (corporate)",
  ],
  [
    '<img src="./materiabtp-assets/images/features/cards/knowledge-base-fr.avif"',
    faqImg,
    "faq (knowledge-base)",
  ],
  [
    '<img src="./materiabtp-assets/images/home/corporate-faq.jpg"',
    faqImg,
    "faq (corporate)",
  ],
];

const done = new Set();
for (const [from, to, label] of targets) {
  if (done.has(label)) continue;
  if (swapImg(from, to)) {
    done.add(label);
    console.log("patched", label);
  }
}

if (!done.has("problems (analysis-fr)") && !done.has("problems (corporate)")) {
  throw new Error("Problem image tag not found");
}
if (
  !done.has("stats desktop (dashboard)") &&
  !done.has("stats desktop (corporate)")
) {
  throw new Error("Stats desktop image tag not found");
}
if (!done.has("faq (knowledge-base)") && !done.has("faq (corporate)")) {
  throw new Error("FAQ image tag not found");
}

html = html.replace(
  /<link rel="preload" as="image" imageSrcSet="\.\/materiabtp-assets\/images\/[^"]+" imageSizes="\(min-width: 1024px\) 24rem, min\(100vw, 28rem\)"\/>/,
  '<link rel="preload" as="image" imageSrcSet="./materiabtp-assets/images/_r/home/corporate-faq-480.jpg 480w, ./materiabtp-assets/images/home/corporate-faq.jpg 960w" imageSizes="(min-width: 1024px) 24rem, min(100vw, 28rem)"/>',
);

fs.writeFileSync("index.html", html);
console.log("user corporate images applied");
