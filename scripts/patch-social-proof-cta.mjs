import fs from "fs";

const path = "src/components/landing/plumtech/landing-markup.ts";
let src = fs.readFileSync(path, "utf8");

const oldCtaCandidates = [
  '<div class=\\"flex flex-col items-center gap-stack-sm\\"><p class=\\"font-display font-bold text-lead text-balance text-center\\">Voyez la diff\u00e9rence sur votre prochain dossier.</p><button type=\\"button\\" class=\\"btn-calendly inline-flex items-center gap-[0.5em] transition-all duration-200 text-[0.9rem] cursor-pointer rounded-[10px] bg-white px-4.5 py-3.5 font-medium text-stone-1200 hover:bg-stone-200\\">R\u00e9server une d\u00e9mo</button></div>',
  '<div class=\\"social-proof-cta relative z-10 mx-auto mt-2 flex w-full max-w-3xl flex-col items-center gap-5 rounded-[22px] px-8 py-10 text-center md:px-10 md:py-12\\"><div class=\\"flex max-w-xl flex-col gap-2\\"><p class=\\"font-display text-[clamp(1.25rem,2.5vw,1.55rem)] font-bold leading-tight text-white\\">Voyez la diff\u00e9rence sur votre prochain dossier.</p><p class=\\"font-body text-sm leading-relaxed text-white/85\\">D\u00e9mo en 30 minutes sur votre propre DCE \u00b7 Sans engagement</p></div><button type=\\"button\\" class=\\"btn-calendly social-proof-cta__btn inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[0.95rem] font-semibold transition-all duration-200 cursor-pointer\\">R\u00e9server une d\u00e9mo <span aria-hidden=\\"true\\">\u2192</span></button></div>',
];

const newCta =
  '<div class=\\"social-proof-cta relative z-10 mx-auto mt-4 flex w-full max-w-3xl flex-col items-center gap-6 rounded-[22px] px-8 py-10 text-center md:px-12 md:py-12\\">' +
  '<div class=\\"flex max-w-xl flex-col gap-2\\">' +
  '<p class=\\"font-display text-[clamp(1.25rem,2.5vw,1.55rem)] font-bold leading-tight text-[var(--mb-ink)]\\">Voyez la diff\u00e9rence sur votre prochain dossier.</p>' +
  '<p class=\\"font-body text-sm leading-relaxed text-[var(--mb-muted)]\\">D\u00e9mo en 30 minutes sur votre propre DCE \u00b7 Sans engagement</p>' +
  "</div>" +
  '<button type=\\"button\\" class=\\"btn-calendly social-proof-cta__btn inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-200 cursor-pointer\\">R\u00e9server une d\u00e9mo <span aria-hidden=\\"true\\">\u2192</span></button>' +
  "</div>";

const oldCta = oldCtaCandidates.find((block) => src.includes(block));
if (!oldCta) {
  console.error("Social proof CTA block not found");
  process.exit(1);
}

src = src.replace(oldCta, newCta);
fs.writeFileSync(path, src, "utf8");
console.log("Social proof CTA upgraded.");
