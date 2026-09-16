import fs from "node:fs";
import path from "node:path";

const indexPath = path.join(import.meta.dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

/** Supprime le grand SVG wireframe derrière le stack sticky */
html = html.replace(
  /<svg aria-hidden="true" class="pointer-events-none absolute overflow-visible translate-x-120[\s\S]*?<\/svg>/g,
  "",
);

/** Supprime les pipes SVG décoratifs (sand / lazuli / stone) — fond unifié en CSS */
html = html.replace(
  /<div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden h-\[round\(up,100%,50rem\)\]"><svg[\s\S]*?<\/svg><\/div>/g,
  "",
);

/** Supprime le pipe sticky derrière les cartes features */
html = html.replace(
  /<div class="pointer-events-none select-none absolute inset-0"><div aria-hidden="true" class="flex w-full h-48[\s\S]*?<\/svg><\/div><\/div>/g,
  "",
);

/** Supprime les calques fade hero (incohérents avec le reste) */
html = html.replace(
  /<div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-white to-40% -top-block"><\/div>/g,
  "",
);
html = html.replace(
  /<div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-t from-white via-white to-transparent -top-block"><\/div>/g,
  "",
);
html = html.replace(
  /<div class="pointer-events-none absolute inset-0 -z-10 h-\[round\(up,100%,50rem\)\] overflow-visible"><\/div>/g,
  "",
);

/** Conteneurs deco vides */
html = html.replace(
  /<div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden h-\[round\(up,100%,50rem\)\]"><\/div>/g,
  "",
);

/** Sections CTA pleine largeur : lazuli → surface claire */
html = html.replace(
  /section class="p-stack md:py-section bg-lazuli-200"/g,
  'section class="p-stack md:py-section bg-surface-plum"',
);

/** Stack features : fond sombre → surface alternée */
html = html.replace(
  /section class="relative isolate overflow-clip bg-stone-1200 text-white"/g,
  'section class="relative isolate overflow-clip bg-surface-plum text-ink-plum"',
);

/** Cartes sticky : pierre sombre → carte blanche PlumTech */
html = html.replace(
  /article\.grid overflow-hidden rounded-xl md:rounded-section border border-stone-1000 bg-stone-1100/g,
  "article.grid overflow-hidden rounded-xl md:rounded-section border border-navy-10 bg-white spot-card-plum",
);

html = html.replace(
  /border border-stone-1000 bg-stone-1100 md:grid-cols/g,
  "border border-navy-10 bg-white spot-card-plum md:grid-cols",
);

/** Cartes features — alternance texte/image comme Tenderbolt (rtl sur cartes paires) */
{
  const sectionStart = html.indexOf("Une plateforme unique");
  const sectionEnd = html.indexOf("</section>", sectionStart);
  if (sectionStart !== -1 && sectionEnd !== -1) {
    const before = html.slice(0, sectionStart);
    const section = html.slice(sectionStart, sectionEnd);
    const after = html.slice(sectionEnd);

    let cardIndex = 0;
    const updatedSection = section.replace(
      /<article class="grid overflow-hidden rounded-xl md:rounded-section border border-navy-10 bg-white spot-card-plum md:grid-cols-\[[^\]]+\][^"]*"/g,
      (match) => {
        cardIndex += 1;
        const withoutRtl = match.replace(/\s*md:\[direction:rtl\]/g, "");
        if (cardIndex % 2 === 0) {
          return withoutRtl.replace(/"$/, ' md:[direction:rtl]"');
        }
        return withoutRtl;
      },
    );

    html = before + updatedSection + after;
  }
}

/** Boutons noirs → primaire logo */
html = html.replace(
  /bg-stone-1200 text-white hover:bg-stone-1000/g,
  "bg-primary text-white hover:bg-lazuli-200 rounded-full",
);

/** Cartes problèmes (div arrondies sombres) → blanc PlumTech */
html = html.replaceAll(
  "rounded-[30px] border border-stone-1000 bg-stone-1100",
  "rounded-[30px] border border-navy-10 bg-white spot-card-plum",
);

/** Titres des cartes problèmes — plus de text-white sur fond blanc */
html = html.replaceAll(
  "font-display font-bold text-body-lg text-white",
  "font-display font-bold text-body-lg text-ink-plum",
);

/** Corps des cartes problèmes — contraste renforcé (hors gradient-hero) */
html = html.replaceAll(
  "font-body text-body text-stone-700 leading-[1.45]",
  "font-body text-body text-body-plum leading-[1.45]",
);

/** Gradient hero — texte clair sur fond bleu */
html = html.replace(
  '<span class="block text-stone-600">traités avec rigueur et traçabilité.</span></h2><p class="font-body text-body text-body-plum leading-[1.45]">DCE, mémoire technique',
  '<span class="block text-white/85">traités avec rigueur et traçabilité.</span></h2><p class="font-body text-body text-white/90 leading-[1.45]">DCE, mémoire technique',
);

html = html.replaceAll(
  'text-caption-lg text-stone-700 leading-[1.45]">DCE → Go/No-Go',
  'text-caption-lg text-white/80 leading-[1.45]">DCE → Go/No-Go',
);

html = html.replaceAll(
  'text-caption-lg text-stone-700 leading-[1.45]">RC • CCTP',
  'text-caption-lg text-white/80 leading-[1.45]">RC • CCTP',
);

html = html.replaceAll(
  "rounded-[10px] bg-stone-1100",
  "rounded-[10px] bg-surface-plum border border-navy-10",
);

/** Section sand / stone sombre → surface cohérente */
html = html.replaceAll("overflow-hidden bg-sand-0", "overflow-hidden bg-surface-plum");
html = html.replaceAll("overflow-clip bg-sand-0", "overflow-clip bg-surface-plum");
html = html.replace(
  'section class="relative isolate overflow-clip bg-stone-1200 px-stack pt-section-sm pb-block md:py-section text-white"',
  'section class="relative isolate overflow-clip bg-surface-plum px-stack pt-section-sm pb-block md:py-section text-ink-plum"',
);

/** CTA final ↔ footer — inversion complète des couleurs */
html = html.replace(
  '<section class="p-stack md:py-section bg-surface-plum"><div class="relative isolate mx-auto max-w-280 overflow-hidden rounded-[40px] px-stack py-section-sm md:p-section-sm shadow-[0_4px_24px_0_#10082226] bg-white">',
  '<section class="p-stack md:py-section cta-final-dark"><div class="relative isolate mx-auto max-w-280 overflow-hidden rounded-[40px] px-stack py-section-sm md:p-section-sm shadow-[0_20px_60px_rgba(0,0,0,0.28)] cta-final-dark__card border border-white/10">',
);

html = html.replace(
  '<h2 class="font-display font-medium text-title-lg/tight text-stone-1200">Pendant que vos concurrents répondent, vous gagnez. <span class="text-stone-900">N&#x27;attendez plus.</span></h2><p class="font-body text-body leading-[1.45] text-stone-800">Réservez une démo.',
  '<h2 class="font-display font-medium text-title-lg/tight text-white">Pendant que vos concurrents répondent, vous gagnez. <span class="text-white/85">N&#x27;attendez plus.</span></h2><p class="font-body text-body leading-[1.45] text-white/80">Réservez une démo.',
);

html = html.replace(
  'form class="w-full max-w-lg items-center rounded-[16px] border border-lazuli-100 bg-lazuli-0 p-1.5 hidden sm:flex"><div class="flex w-full items-center gap-2 rounded-[12px] border border-lazuli-200 bg-white p-2.5"><input type="email" placeholder="Entrez votre email..." class="min-w-0 flex-1 bg-transparent px-2 font-body text-body text-stone-1200 outline-none placeholder:text-stone-600" value=""/><button type="submit" class="shrink-0 cursor-pointer rounded-[8px] bg-stone-1200 px-4.5 py-3 font-body font-medium text-white transition-colors hover:bg-stone-1000">Réserver une démo</button>',
  'form class="w-full max-w-lg items-center rounded-[16px] border border-white/15 bg-white/10 p-1.5 hidden sm:flex"><div class="flex w-full items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 p-2.5"><input type="email" placeholder="Entrez votre email..." class="min-w-0 flex-1 bg-transparent px-2 font-body text-body text-white outline-none placeholder:text-white/55" value=""/><button type="submit" class="shrink-0 cursor-pointer rounded-[8px] bg-white px-4.5 py-3 font-body font-medium text-primary transition-colors hover:bg-white/90">Réserver une démo</button>',
);

html = html.replace(
  '<footer class="border-t border-sand-100/40 bg-stone-1200 pt-section-sm font-body text-stone-700">',
  '<footer class="border-t border-navy-10 bg-surface-plum pt-section-sm font-body text-body-plum footer-light">',
);

html = html.replaceAll(
  '<h3 class="mb-stack-sm font-display text-body font-bold text-white">',
  '<h3 class="mb-stack-sm font-display text-body font-bold text-ink-plum">',
);

html = html.replaceAll(
  'class="text-meta font-normal text-stone-700 transition-colors duration-300 hover:text-white"',
  'class="text-meta font-normal text-muted-plum transition-colors duration-300 hover:text-primary"',
);

html = html.replace(
  'class="flex size-10 items-center justify-center rounded-md bg-[#353532]/70 transition-colors hover:bg-[#353532]"',
  'class="flex size-10 items-center justify-center rounded-md border border-navy-10 bg-white text-primary transition-colors hover:bg-surface-plum"',
);

html = html.replace(
  '<rect width="32" height="32" rx="5" fill="white" mask="url(#_R_mndivb_)"',
  '<rect width="32" height="32" rx="5" fill="currentColor" mask="url(#_R_mndivb_)"',
);

html = html.replace(
  'border-t border-white/10 py-8"><p class="text-caption">©',
  'border-t border-navy-10 py-8"><p class="text-caption text-muted-plum">©',
);

html = html.replace(
  'class="text-caption font-normal text-stone-700 underline underline-offset-4 transition-colors duration-300 hover:text-white" href="/fr/legal">Mentions légales',
  'class="text-caption font-normal text-muted-plum underline underline-offset-4 transition-colors duration-300 hover:text-primary" href="/fr/legal">Mentions légales',
);

html = html.replace(
  '<p class="text-meta/relaxed">Assistant IA pour analyser vos DCE',
  '<p class="text-meta/relaxed text-muted-plum">Assistant IA pour analyser vos DCE',
);

fs.writeFileSync(indexPath, html);
console.log("PlumTech cards + pattern cleanup applied to index.html");
