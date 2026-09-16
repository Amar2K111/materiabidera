import fs from "node:fs";
import path from "node:path";

const indexPath = path.join(import.meta.dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const statsAlt =
  "Chargé d'affaires BTP au bureau, préparation d'une réponse à appel d'offres";
const faqAlt =
  "Responsable AO relisant le DCE et le mémoire technique avant remise";

const faqSrcSet =
  "./materiabtp-assets/images/_r/home/corporate-faq-480.jpg 480w, ./materiabtp-assets/images/_r/home/corporate-faq-640.jpg 640w, ./materiabtp-assets/images/features/cards/knowledge-base-fr.png 960w";

const statsDesktopImg = `<img src="./materiabtp-assets/images/home/social-proof.jpg" alt="${statsAlt}" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center stats-panel-img"/>`;

const statsMobileImg = `<img src="./materiabtp-assets/images/home/social-proof.jpg" alt="${statsAlt}" fetchPriority="low" class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-center stats-panel-img"/>`;

const faqImg = `<img src="./materiabtp-assets/images/features/cards/knowledge-base-fr.png" srcSet="${faqSrcSet}" sizes="(min-width: 1024px) 24rem, min(100vw, 28rem)" alt="${faqAlt}" width="505" height="542" class="relative w-full rounded-3xl object-cover object-center faq-panel-img"/>`;

/** Stats panel → image FAQ (corporate) + miroir */
const statsDesktopFaq = `<img src="./materiabtp-assets/images/features/cards/knowledge-base-fr.png" srcSet="${faqSrcSet}" sizes="(min-width: 768px) 50vw, 1px" alt="${faqAlt}" fetchPriority="low" class="absolute inset-0 size-full object-cover object-center stats-panel-img"/>`;

const statsMobileFaq = `<img src="./materiabtp-assets/images/features/cards/knowledge-base-fr.png" alt="${faqAlt}" fetchPriority="low" class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-center stats-panel-img"/>`;

/** FAQ → photo bureau + miroir */
const faqSocial = `<img src="./materiabtp-assets/images/home/faq-panel.jpg" alt="${statsAlt}" width="505" height="542" class="relative w-full rounded-3xl object-cover object-center faq-panel-img"/>`;

const PLACEHOLDER_STATS_DESKTOP = "__SWAP_STATS_DESKTOP__";
const PLACEHOLDER_STATS_MOBILE = "__SWAP_STATS_MOBILE__";
const PLACEHOLDER_FAQ = "__SWAP_FAQ__";

html = html.replace(statsDesktopImg, PLACEHOLDER_STATS_DESKTOP);
html = html.replace(statsMobileImg, PLACEHOLDER_STATS_MOBILE);
html = html.replace(faqImg.replace(" faq-panel-img", ""), PLACEHOLDER_FAQ);

// Also match faq img without faq-panel-img if not yet patched
if (!html.includes(PLACEHOLDER_FAQ)) {
  html = html.replace(
    /<img src="\.\/materiabtp-assets\/images\/features\/cards\/knowledge-base-fr\.png" srcSet="\.\/materiabtp-assets\/images\/_r\/home\/corporate-faq-480\.jpg 480w, \.\/materiabtp-assets\/images\/_r\/home\/corporate-faq-640\.jpg 640w, \.\/materiabtp-assets\/images\/features\/cards\/knowledge-base-fr\.png 960w" sizes="\(min-width: 1024px\) 24rem, min\(100vw, 28rem\)" alt="Responsable AO relisant le DCE et le mémoire technique avant remise" width="505" height="542" class="relative w-full rounded-3xl object-cover object-center"\/>/,
    PLACEHOLDER_FAQ,
  );
}

html = html.replace(PLACEHOLDER_STATS_DESKTOP, statsDesktopFaq);
html = html.replace(PLACEHOLDER_STATS_MOBILE, statsMobileFaq);
html = html.replace(PLACEHOLDER_FAQ, faqSocial);

fs.writeFileSync(indexPath, html);
console.log("Swapped stats ↔ FAQ images (both mirrored)");
