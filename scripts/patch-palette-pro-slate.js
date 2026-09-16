const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

/* Direction « Ardoise & Sauge » — pro, élégant, B2B BTP */
const INK = "#0f172a";
const INK_SOFT = "#334155";
const MUTED = "#64748b";
const SUBTLE = "#94a3b8";
const PAGE = "#f8fafc";
const SURFACE = "#ffffff";
const BORDER = "#e2e8f0";
const BORDER_SOFT = "#f1f5f9";
const ACCENT = "#0f766e";
const ACCENT_HOVER = "#115e59";
const ACCENT_LIGHT = "#ccfbf1";
const HERO_START = "#1e293b";
const HERO_END = "#0f172a";
const FOOTER = "#0f172a";

const ICON_TEAL = "#0f766e";
const ICON_BLUE = "#0369a1";
const ICON_VIOLET = "#6d28d9";
const ICON_AMBER = "#b45309";
const ICON_GREEN = "#15803d";

// index.html — calculateur + logo nav claire
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(/logo-materiabtp-wordmark-light\.png/g, "logo-materiabtp-wordmark.png")
  .replace(
    /--mc-accent:var\(--color-dark-orange-100,#[0-9A-Fa-f]+\);--mc-accent-deep:var\(--color-ember-200,#[0-9A-Fa-f]+\);--mc-accent-soft:#[0-9A-Fa-f]+/,
    `--mc-accent:var(--color-dark-orange-100,${ACCENT});--mc-accent-deep:var(--color-ember-200,${ACCENT_HOVER});--mc-accent-soft:${ACCENT_LIGHT}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-num span:first-child\{color:#[0-9A-Fa-f]+\}/,
    `#materia-roi-calc .mc-result-num span:first-child{color:${ACCENT}}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result\{background:[^}]+\}/,
    `#materia-roi-calc .mc-result{background:${SURFACE};border:1px solid ${BORDER};color:${INK}}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-label\{color:[^}]+\}/,
    `#materia-roi-calc .mc-result-label{color:${MUTED};opacity:1}`,
  )
  .replace(
    /box-shadow:0 1px 3px rgba\([^)]+\)/g,
    "box-shadow:0 1px 2px rgba(15,23,42,.06)",
  );
fs.writeFileSync(path.join(root, "index.html"), html);

const css = `/* MateriaBTP — Design system (localhost:3000)
   Direction « Ardoise & Sauge » · pro · élégant · B2B */

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

:root {
  --color-primary: ${ACCENT};
  --color-foreground: ${INK};
  --color-background: ${PAGE};
  --color-border: ${BORDER};
  --color-muted: ${MUTED};
  --color-surface: ${SURFACE};

  --color-ember-0: ${ACCENT_LIGHT};
  --color-ember-50: ${ACCENT};
  --color-ember-100: ${ACCENT};
  --color-ember-200: ${ACCENT_HOVER};
  --color-dark-orange-100: ${ACCENT};
  --color-dark-orange-200: ${ACCENT_HOVER};
  --color-lazuli-0: #e0f2fe;
  --color-lazuli-100: #bae6fd;
  --color-lazuli-200: ${HERO_START};
  --color-lazuli-300: ${HERO_END};
  --color-purple-0: #ede9fe;
  --color-purple-100: ${ICON_VIOLET};
  --color-gold: ${ICON_AMBER};
  --color-gold-0: #fef3c7;
  --color-gold-100: ${ICON_AMBER};
  --color-mustard-0: #fef3c7;
  --color-mustard-100: ${ICON_AMBER};
  --color-amber-0: #fef3c7;
  --color-amber-100: ${ICON_AMBER};
  --color-emerald-0: #dcfce7;
  --color-emerald-100: ${ICON_GREEN};
  --color-teal-0: ${ACCENT_LIGHT};
  --color-teal-100: ${ACCENT};
  --color-coral: #dc2626;
  --color-moss: ${ICON_GREEN};

  --color-icon-purple: ${ICON_VIOLET};
  --color-icon-amber: ${ICON_AMBER};
  --color-icon-teal: ${ICON_TEAL};
  --color-icon-lime: ${ICON_GREEN};
  --color-icon-blue: ${ICON_BLUE};

  --color-stone-100: ${PAGE};
  --color-stone-200: ${BORDER_SOFT};
  --color-stone-300: ${BORDER};
  --color-stone-400: ${BORDER};
  --color-stone-500: ${SUBTLE};
  --color-stone-600: ${MUTED};
  --color-stone-700: ${MUTED};
  --color-stone-800: ${INK_SOFT};
  --color-stone-900: ${INK_SOFT};
  --color-stone-1000: ${BORDER};
  --color-stone-1100: ${INK};
  --color-stone-1200: ${SURFACE};
  --color-stone-1300: ${FOOTER};
  --color-sand-0: ${PAGE};
  --color-sand-100: ${BORDER};
  --color-wireframe: ${SUBTLE};
  --color-wireframe-line: ${MUTED};

  --font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* ── Base ── */
html,
body,
main,
.font-body,
.font-display,
.font-sans,
.prose {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

html,
body {
  background-color: ${PAGE} !important;
  color: ${INK} !important;
}

main {
  background-color: ${PAGE} !important;
  color: ${INK} !important;
}

h1, h2, h3,
.font-display.text-display,
.text-display, .text-display-lg, .text-display-xl {
  font-weight: 700 !important;
  font-variation-settings: normal !important;
  color: inherit;
}

h2, .text-title-lg { font-weight: 700 !important; }
h3, .text-title { font-weight: 600 !important; }
.font-wide { font-variation-settings: normal !important; }

/* ── Navigation — blanche, épurée ── */
header .bg-stone-1200,
header .border-stone-1000 {
  background-color: ${SURFACE} !important;
  border-color: ${BORDER} !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06) !important;
}

header,
header .text-white,
header nav .text-stone-700,
header nav button,
header nav a {
  color: ${INK} !important;
}

header nav button:hover,
header nav a:hover,
header .hover\\:text-white:hover {
  color: ${ACCENT} !important;
}

header .bg-ember-100,
header a.bg-ember-100 {
  background-color: ${ACCENT} !important;
  color: ${SURFACE} !important;
  border: 1px solid ${ACCENT} !important;
}

header .bg-ember-100:hover,
header a.bg-ember-100:hover,
header .hover\\:bg-ember-200:hover {
  background-color: ${ACCENT_HOVER} !important;
  border-color: ${ACCENT_HOVER} !important;
  color: ${SURFACE} !important;
}

/* ── Boutons CTA ── */
.bg-ember-100,
.bg-dark-orange-100 {
  background-color: ${ACCENT} !important;
  color: ${SURFACE} !important;
  border: 1px solid ${ACCENT} !important;
}

.hover\\:bg-ember-200:hover,
.bg-dark-orange-200,
.hover\\:bg-stone-1100:hover {
  background-color: ${ACCENT_HOVER} !important;
  color: ${SURFACE} !important;
  border-color: ${ACCENT_HOVER} !important;
}

/* ── Sections — fond clair alterné ── */
.bg-sand-0,
.bg-stone-100,
.bg-stone-200,
section.bg-white,
main > section.bg-white {
  background-color: ${PAGE} !important;
  color: ${INK} !important;
}

.bg-lazuli-200 {
  background-color: ${HERO_START} !important;
}

.bg-lazuli-300 {
  background-color: ${HERO_END} !important;
}

main .bg-stone-1200,
section.bg-stone-1200 {
  background-color: ${PAGE} !important;
}

/* ── Hero — ardoise profonde, texte blanc ── */
.gradient-hero {
  background-color: ${HERO_END} !important;
  background-image: linear-gradient(165deg, ${HERO_START} 0%, ${HERO_END} 100%) !important;
  color: ${SURFACE} !important;
}

.gradient-hero,
.gradient-hero h1,
.gradient-hero h2,
.gradient-hero h3,
.gradient-hero p,
.gradient-hero li,
.gradient-hero span,
.gradient-hero .text-stone-1200,
.gradient-hero .text-stone-1100 {
  color: ${SURFACE} !important;
}

.gradient-hero .text-stone-600,
.gradient-hero .text-stone-700,
.gradient-hero .text-stone-800,
.gradient-hero .text-stone-900 {
  color: rgba(248, 250, 252, 0.72) !important;
}

.gradient-shape-hero,
.gradient-shape-hero-flipped {
  background-image: linear-gradient(165deg, rgba(15, 118, 110, 0.08) 0%, transparent 60%) !important;
}

/* Hero clair (première section bg-white) */
main > section.bg-white:first-of-type,
main > section.bg-white.pt-header {
  background-color: ${SURFACE} !important;
}

main > section.bg-white:first-of-type h1,
main > section.bg-white.pt-header h1 {
  color: ${INK} !important;
}

main > section.bg-white:first-of-type .text-stone-600,
main > section.bg-white:first-of-type .text-stone-700,
main > section.bg-white:first-of-type .text-stone-800 {
  color: ${MUTED} !important;
}

/* ── Cartes — blanches, bordure fine ── */
.bg-stone-1100,
.rounded-\\[30px\\].border.border-stone-1000.bg-stone-1100,
.flex.flex-col.gap-stack-sm.rounded-\\[30px\\].border.border-stone-1000.bg-stone-1100 {
  background-color: ${SURFACE} !important;
  border-color: ${BORDER} !important;
  color: ${INK} !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06) !important;
}

.bg-stone-1100 .text-white {
  color: ${INK} !important;
}

.bg-stone-1100 .text-stone-600,
.bg-stone-1100 .text-stone-700,
.bg-stone-1100 .text-stone-800,
.bg-stone-1100 .text-stone-900 {
  color: ${MUTED} !important;
}

.rounded-\\[40px\\],
.rounded-\\[22px\\].bg-white,
.rounded-\\[30px\\].bg-dark-orange-100 {
  background-color: ${SURFACE} !important;
  border-color: ${BORDER} !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06) !important;
}

.shadow-card,
.shadow-sm,
.shadow-panel {
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06) !important;
}

.border-stone-300,
.border-stone-400,
.border-stone-1000,
.border-lazuli-100,
.border-lazuli-200 {
  border-color: ${BORDER} !important;
}

.inline-flex.items-center.rounded-full.border.border-stone-300.bg-stone-100 {
  background-color: ${BORDER_SOFT} !important;
  border-color: ${BORDER} !important;
  color: ${INK_SOFT} !important;
}

/* ── Typographie ── */
.text-stone-1100,
.text-stone-1200,
.text-\\[\\#272721\\] {
  color: ${INK} !important;
}

.text-stone-600,
.text-stone-700,
.text-stone-800,
.text-stone-900,
.text-wireframe\\/70,
.text-wireframe-line\\/75 {
  color: ${MUTED} !important;
}

.text-white {
  color: ${SURFACE} !important;
}

section.bg-white .text-stone-1100,
.bg-sand-0 .text-stone-1100 {
  color: ${INK} !important;
}

/* ── Accents discrets (badges, icônes) ── */
.text-primary,
.tabler-icon-check,
.tabler-icon-check.text-primary,
svg.text-primary {
  color: ${ACCENT} !important;
}

.text-icon-teal { color: ${ICON_TEAL} !important; }
.text-icon-blue { color: ${ICON_BLUE} !important; }
.text-icon-purple { color: ${ICON_VIOLET} !important; }
.text-icon-amber { color: ${ICON_AMBER} !important; }
.text-icon-lime { color: ${ICON_GREEN} !important; }

.bg-icon-teal { background-color: ${ICON_TEAL} !important; }
.bg-icon-blue { background-color: ${ICON_BLUE} !important; }
.bg-icon-purple { background-color: ${ICON_VIOLET} !important; }
.bg-icon-amber { background-color: ${ICON_AMBER} !important; }
.bg-icon-lime { background-color: ${ICON_GREEN} !important; }

.bg-icon-teal\\/10 { background-color: rgba(15, 118, 110, 0.1) !important; }
.bg-icon-blue\\/10 { background-color: rgba(3, 105, 161, 0.1) !important; }
.bg-icon-purple\\/10 { background-color: rgba(109, 40, 217, 0.1) !important; }
.bg-icon-amber\\/10 { background-color: rgba(180, 83, 9, 0.1) !important; }
.bg-icon-lime\\/10 { background-color: rgba(21, 128, 61, 0.1) !important; }

.bg-icon-teal\\/20 { background-color: rgba(15, 118, 110, 0.16) !important; }
.bg-icon-blue\\/20 { background-color: rgba(3, 105, 161, 0.16) !important; }
.bg-icon-purple\\/20 { background-color: rgba(109, 40, 217, 0.16) !important; }
.bg-icon-amber\\/20 { background-color: rgba(180, 83, 9, 0.16) !important; }
.bg-icon-lime\\/20 { background-color: rgba(21, 128, 61, 0.16) !important; }

.text-emerald-100, .text-moss { color: ${ICON_GREEN} !important; }
.text-mustard-100, .text-amber-100 { color: ${ICON_AMBER} !important; }
.text-gold, .text-gold-100, .text-purple-100,
.text-lazuli-200, .text-lazuli-300, .text-ember-100 {
  color: ${ACCENT} !important;
}

.bg-emerald-0 { background-color: rgba(21, 128, 61, 0.1) !important; }
.bg-emerald-100 { background-color: ${ICON_GREEN} !important; }
.bg-mustard-0, .bg-amber-0 { background-color: rgba(180, 83, 9, 0.1) !important; }
.bg-coral { background-color: #dc2626 !important; }
.bg-lazuli-100 { background-color: rgba(15, 118, 110, 0.1) !important; }
.bg-ember-0, .bg-lazuli-0, .bg-purple-0 { background-color: ${BORDER_SOFT} !important; }

/* ── Footer — ardoise ── */
footer,
footer .bg-stone-1200,
footer .bg-stone-1300,
.bg-stone-1300 {
  background-color: ${FOOTER} !important;
}

footer .text-white,
.bg-stone-1300 .text-white,
footer a,
footer p,
footer li {
  color: rgba(248, 250, 252, 0.88) !important;
}

footer a:hover {
  color: ${SURFACE} !important;
}

/* ── Formulaires ── */
input, textarea, select {
  border-color: ${BORDER} !important;
  background-color: ${SURFACE} !important;
  color: ${INK} !important;
}

input:focus, textarea:focus, select:focus,
.focus\\:border-ember-100:focus {
  border-color: ${ACCENT} !important;
  outline: 2px solid rgba(15, 118, 110, 0.18) !important;
  outline-offset: 0;
}

.placeholder\\:text-stone-600::placeholder {
  color: ${SUBTLE} !important;
}

/* ── Prose ── */
.prose { color: ${INK} !important; }
.prose a:hover { color: ${ACCENT} !important; }
.prose th {
  background-color: ${BORDER_SOFT} !important;
  color: ${INK} !important;
  border-color: ${BORDER} !important;
}
.prose td { border-color: ${BORDER} !important; }
.prose tr:nth-child(odd) td { background-color: ${SURFACE} !important; }
.prose tr:nth-child(even) td { background-color: ${PAGE} !important; }
.prose blockquote {
  background-color: ${BORDER_SOFT} !important;
  color: ${INK_SOFT} !important;
}
.prose table { border-color: ${BORDER} !important; }

/* ── Calculateur ROI ── */
#materia-roi-calc .mc-result {
  background: ${SURFACE} !important;
  border: 1px solid ${BORDER} !important;
  color: ${INK} !important;
  border-radius: 10px !important;
}

#materia-roi-calc .mc-result::before { display: none !important; }

#materia-roi-calc .mc-result-num span:first-child {
  color: ${ACCENT} !important;
}

#materia-roi-calc .mc-result-label {
  color: ${MUTED} !important;
  opacity: 1 !important;
}

.rounded-\\[30px\\].bg-dark-orange-100 {
  background-color: ${SURFACE} !important;
  border: 1px solid ${BORDER} !important;
}

/* ── Feature panels ── */
article.grid .bg-lazuli-200 {
  background-color: ${BORDER_SOFT} !important;
  background-image: radial-gradient(circle, ${BORDER} 0.55px, transparent 0.55px) !important;
  background-size: 20px 20px !important;
}

section.bg-lazuli-200 {
  background-color: ${PAGE} !important;
  background-image: none !important;
}

/* ── Motifs décoratifs masqués ── */
[style*="mask-image:url(./materiabtp-assets/images/shape.svg)"],
[style*="-webkit-mask-image:url(./materiabtp-assets/images/shape.svg)"] {
  display: none !important;
}

svg[aria-hidden="true"]:has(path[d*="4396.1"]),
svg[aria-hidden="true"]:has(use[href="#_S_1_"]),
svg[aria-hidden="true"]:has(use[href^="#_R_"]) {
  display: none !important;
}

img[src*="wireframe-arrow"] { display: none !important; }

svg[aria-hidden="true"].text-wireframe\\/70,
svg[aria-hidden="true"].text-wireframe-line\\/75 {
  display: none !important;
}

@media (min-width: 640px) {
  main > section:first-of-type ul.flex.flex-col > li > span.text-meta-lg {
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

fs.writeFileSync(
  path.join(root, "materiabtp-assets", "materia-design-system.css"),
  css,
);
console.log("Palette « Ardoise & Sauge » appliquée");
