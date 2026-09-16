import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const problemsImg = `<img src="./materiabtp-assets/images/home/corporate-problems.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-problems-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-problems-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-problems-960.jpg 960w, ./materiabtp-assets/images/home/corporate-problems.jpg 1440w" sizes="(min-width: 1024px) 40rem, min(80vw, 26rem)" alt="Équipe BTP en réunion autour de plans et documents de chantier" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center"/>`;

const statsImgDesktop = `<img src="./materiabtp-assets/images/home/corporate-stats.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-stats-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-stats-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-stats-960.jpg 960w, ./materiabtp-assets/images/home/corporate-stats.jpg 1440w" sizes="(min-width: 768px) 30rem, 1px" alt="Collaborateurs en réunion pour préparer une réponse à appel d'offres" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center"/>`;

const statsImgMobile = `<img src="./materiabtp-assets/images/home/corporate-stats.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-stats-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-stats-640.jpg 640w, ./materiabtp-assets/images/_r/home/corporate-stats-960.jpg 960w, ./materiabtp-assets/images/home/corporate-stats.jpg 1440w" sizes="(min-width: 768px) 1px, 30vw" alt="Collaborateurs en réunion pour préparer une réponse à appel d'offres" fetchPriority="low" class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-center"/>`;

const faqImg = `<img src="./materiabtp-assets/images/home/corporate-faq.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-faq-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-faq-640.jpg 640w, ./materiabtp-assets/images/home/corporate-faq.jpg 960w" sizes="(min-width: 1024px) 24rem, min(100vw, 28rem)" alt="Professionnels échangeant sur un dossier avant la remise de l'offre" width="505" height="542" class="relative w-full rounded-3xl object-cover object-center"/>`;

function swapImg(fromStart, toTag) {
  const start = html.indexOf(fromStart);
  if (start === -1) return false;
  const end = html.indexOf("/>", start) + 2;
  html = html.slice(0, start) + toTag + html.slice(end);
  return true;
}

if (
  !swapImg(
    '<img src="./materiabtp-assets/images/features/cards/analysis-fr.avif"',
    problemsImg,
  )
) {
  throw new Error("Problem section image not found");
}

if (
  !swapImg(
    '<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden"><img src="./materiabtp-assets/images/hero/dashboard-fr.avif"',
    `<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden">${statsImgMobile}`,
  )
) {
  throw new Error("Mobile stats image not found");
}

if (
  !swapImg(
    '<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch"><img src="./materiabtp-assets/images/hero/dashboard-fr.avif"',
    `<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch">${statsImgDesktop}`,
  )
) {
  throw new Error("Desktop stats image not found");
}

if (
  !swapImg(
    '<img src="./materiabtp-assets/images/features/cards/knowledge-base-fr.avif"',
    faqImg,
  )
) {
  throw new Error("FAQ image not found");
}

html = html.replace(
  /<link rel="preload" as="image" imageSrcSet="\.\/materiabtp-assets\/images\/_r\/[^"]+" imageSizes="\(min-width: 1024px\) 24rem, min\(100vw, 28rem\)"\/>/,
  '<link rel="preload" as="image" imageSrcSet="./materiabtp-assets/images/_r/home/corporate-faq-480.jpg 480w, ./materiabtp-assets/images/home/corporate-faq.jpg 960w" imageSizes="(min-width: 1024px) 24rem, min(100vw, 28rem)"/>',
);

html = html
  .split(
    "Capture MateriaBTP : analyse structurée d'un DCE (RC, CCTP, critères de jugement)",
  )
  .join("Équipe BTP en réunion autour de plans et documents de chantier");
html = html
  .split(
    "Capture MateriaBTP : tableau de bord de suivi des dossiers appels d'offres",
  )
  .join("Collaborateurs en réunion pour préparer une réponse à appel d'offres");
html = html
  .split(
    "Capture MateriaBTP : base entreprise (moyens, références et méthodes)",
  )
  .join("Professionnels échangeant sur un dossier avant la remise de l'offre");

if (!html.includes("corporate-problems.jpg")) {
  throw new Error("Corporate images not wired");
}

fs.writeFileSync(htmlPath, html);
console.log("landing images → corporate human photos");
