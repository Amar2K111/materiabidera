import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const faqImg =
  '<img src="./materiabtp-assets/images/home/corporate-faq.jpg" srcSet="./materiabtp-assets/images/_r/home/corporate-faq-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-faq-640.jpg 640w, ./materiabtp-assets/images/home/corporate-faq.jpg 960w" sizes="(min-width: 1024px) 24rem, min(100vw, 28rem)" alt="Responsable AO relisant le DCE et le mémoire technique avant remise" width="505" height="542" class="relative w-full rounded-3xl object-cover object-center"/>';

const statsAlt =
  "Chargé d'affaires BTP au bureau, préparation d'une réponse à appel d'offres";

const statsMobileImg = `<img src="./materiabtp-assets/images/home/social-proof.jpg" alt="${statsAlt}" fetchPriority="low" class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-center stats-panel-img"/>`;

const statsDesktopImg = `<img src="./materiabtp-assets/images/home/social-proof.jpg" alt="${statsAlt}" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center stats-panel-img"/>`;

const beforeFaq = html.includes("faq.avif");
const beforeStats = html.includes("corporate-stats.jpg");

html = html.replace(
  /<img src="\.\/materiabtp-assets\/images\/faq\.avif"[^>]*\/>/g,
  faqImg,
);

html = html.replace(
  /<div class="relative w-3\/10 min-h-\[20cqi\] shrink-0 self-stretch md:hidden"><img src="\.\/materiabtp-assets\/images\/home\/corporate-stats\.jpg"[^>]*\/>/,
  `<div class="relative w-3/10 min-h-[20cqi] shrink-0 self-stretch md:hidden">${statsMobileImg}`,
);

html = html.replace(
  /<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-\[#fafbf8\] md:block md:flex-1 md:basis-0 md:self-stretch"><img src="\.\/materiabtp-assets\/images\/home\/corporate-stats\.jpg"[^>]*\/>/,
  `<div class="relative hidden overflow-hidden rounded-xl border border-stone-400 bg-[#fafbf8] md:block md:flex-1 md:basis-0 md:self-stretch">${statsDesktopImg}`,
);

fs.writeFileSync(htmlPath, html);

console.log("FAQ image:", beforeFaq ? "faq.avif → corporate-faq.jpg" : "already updated");
console.log(
  "Stats image:",
  beforeStats ? "corporate-stats.jpg → social-proof.avif" : "already updated",
);
console.log("faq.avif left:", html.includes("faq.avif"));
console.log("corporate-stats in calc:", html.includes("corporate-stats.jpg"));
