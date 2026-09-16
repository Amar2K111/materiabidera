const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

/* Dark inverse — fond noir, nav blanche, cartes blanches, accents Tenderbolt */
const BLACK = "#0a0a0a";
const BLACK_DEEP = "#000000";
const WHITE = "#ffffff";
const MUTED = "#a3a3a3";
const MUTED_CARD = "#525252";
const BORDER_DARK = "#262626";
const BORDER_LIGHT = "#e5e5e5";

const ACCENT_BLUE = "#2563eb";
const ACCENT_ORANGE = "#ea580c";
const ACCENT_GREEN = "#16a34a";
const ACCENT_VIOLET = "#7c3aed";

// index.html — logo dark on white nav + calculateur
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(/logo-materiabtp-wordmark-light\.png/g, "logo-materiabtp-wordmark.png")
  .replace(
    /--mc-accent:var\(--color-dark-orange-100,#[0-9A-Fa-f]+\);--mc-accent-deep:var\(--color-ember-200,#[0-9A-Fa-f]+\);--mc-accent-soft:#[0-9A-Fa-f]+/,
    `--mc-accent:var(--color-dark-orange-100,${ACCENT_BLUE});--mc-accent-deep:var(--color-ember-200,${BLACK});--mc-accent-soft:${BORDER_LIGHT}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-num span:first-child\{color:#[0-9A-Fa-f]+\}/,
    `#materia-roi-calc .mc-result-num span:first-child{color:${ACCENT_BLUE}}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result\{background:[^}]+\}/,
    `#materia-roi-calc .mc-result{background:${WHITE};border:1px solid ${BORDER_LIGHT};color:${BLACK}}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-label\{color:[^}]+\}/,
    `#materia-roi-calc .mc-result-label{color:${MUTED_CARD};opacity:1}`,
  )
  .replace(
    /box-shadow:0 1px 3px rgba\([^)]+\)/g,
    "box-shadow:0 1px 3px rgba(0,0,0,.08)",
  );
fs.writeFileSync(path.join(root, "index.html"), html);

const css = `/* MateriaBTP — Design system override (static landing, localhost:3000)
   Dark inverse · fond noir · nav blanche · cartes blanches · accents Tenderbolt */

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

:root {
  --color-primary: ${ACCENT_BLUE};
  --color-foreground: ${WHITE};
  --color-background: ${BLACK};
  --color-border: ${BORDER_DARK};
  --color-muted: ${MUTED};
  --color-surface: ${WHITE};

  --color-ember-0: rgba(234, 88, 12, 0.12);
  --color-ember-50: ${ACCENT_ORANGE};
  --color-ember-100: ${WHITE};
  --color-ember-200: ${BLACK};
  --color-dark-orange-100: ${WHITE};
  --color-dark-orange-200: ${BLACK};
  --color-lazuli-0: rgba(37, 99, 235, 0.12);
  --color-lazuli-100: rgba(37, 99, 235, 0.2);
  --color-lazuli-200: ${ACCENT_BLUE};
  --color-lazuli-300: #1d4ed8;
  --color-purple-0: rgba(124, 58, 237, 0.12);
  --color-purple-100: ${ACCENT_VIOLET};
  --color-gold: ${ACCENT_ORANGE};
  --color-gold-0: rgba(234, 88, 12, 0.12);
  --color-gold-100: ${ACCENT_ORANGE};
  --color-mustard-0: rgba(234, 88, 12, 0.12);
  --color-mustard-100: ${ACCENT_ORANGE};
  --color-amber-0: rgba(234, 88, 12, 0.12);
  --color-amber-100: ${ACCENT_ORANGE};
  --color-emerald-0: rgba(22, 163, 74, 0.12);
  --color-emerald-100: ${ACCENT_GREEN};
  --color-teal-0: rgba(37, 99, 235, 0.12);
  --color-teal-100: ${ACCENT_BLUE};
  --color-coral: #dc2626;
  --color-moss: ${ACCENT_GREEN};

  --color-icon-purple: ${ACCENT_VIOLET};
  --color-icon-amber: ${ACCENT_ORANGE};
  --color-icon-teal: ${ACCENT_BLUE};
  --color-icon-lime: ${ACCENT_GREEN};
  --color-icon-blue: ${ACCENT_BLUE};

  --color-stone-100: ${BLACK};
  --color-stone-200: ${BLACK};
  --color-stone-300: ${BORDER_LIGHT};
  --color-stone-400: ${BORDER_LIGHT};
  --color-stone-500: #737373;
  --color-stone-600: ${MUTED};
  --color-stone-700: ${MUTED};
  --color-stone-800: #d4d4d4;
  --color-stone-900: #e5e5e5;
  --color-stone-1000: ${BORDER_DARK};
  --color-stone-1100: ${WHITE};
  --color-stone-1200: ${BLACK};
  --color-stone-1300: ${BLACK};
  --color-sand-0: ${BLACK};
  --color-sand-100: ${BORDER_DARK};
  --color-wireframe: ${MUTED};
  --color-wireframe-line: #525252;

  --font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --font-body: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --font-display: Inter, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

html,
body,
.font-body,
.font-display,
.font-sans,
.prose {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif !important;
}

body,
main {
  background-color: ${BLACK} !important;
  color: ${WHITE} !important;
}

h1,
h2,
h3,
.font-display.text-display,
.text-display,
.text-display-lg,
.text-display-xl {
  font-weight: 700 !important;
  font-variation-settings: normal !important;
}

h2,
.text-title-lg {
  font-weight: 700 !important;
}

h3,
.text-title {
  font-weight: 600 !important;
}

.font-wide {
  font-variation-settings: normal !important;
}

/* ── Navigation blanche (inverse Tenderbolt) ── */
header .bg-stone-1200,
header .border-stone-1000 {
  background-color: ${WHITE} !important;
  border-color: ${BORDER_LIGHT} !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

header,
header .text-white,
header nav .text-stone-700,
header nav button,
header nav a {
  color: ${BLACK} !important;
}

header nav button:hover,
header nav a:hover,
header .hover\\:text-white:hover {
  color: ${MUTED_CARD} !important;
}

header .bg-ember-100,
header a.bg-ember-100 {
  background-color: ${BLACK} !important;
  color: ${WHITE} !important;
  border: 1px solid ${BLACK} !important;
}

header .bg-ember-100:hover,
header a.bg-ember-100:hover,
header .hover\\:bg-ember-200:hover {
  background-color: ${WHITE} !important;
  color: ${BLACK} !important;
  border-color: ${BLACK} !important;
}

/* ── Boutons CTA — blanc sur fond noir ── */
.bg-ember-100,
.bg-dark-orange-100 {
  background-color: ${WHITE} !important;
  color: ${BLACK} !important;
  border: 1px solid ${WHITE} !important;
}

.hover\\:bg-ember-200:hover,
.bg-dark-orange-200,
.hover\\:bg-stone-1100:hover {
  background-color: ${BLACK} !important;
  color: ${WHITE} !important;
  border-color: ${WHITE} !important;
}

.bg-lazuli-200 {
  background-color: ${BLACK} !important;
}

.bg-lazuli-300 {
  background-color: ${BLACK_DEEP} !important;
}

/* ── Sections — fond noir ── */
.bg-sand-0,
.bg-stone-100,
.bg-stone-200,
section.bg-lazuli-200 {
  background-color: ${BLACK} !important;
  background-image: none !important;
}

.bg-stone-1200:not(header *) {
  background-color: ${BLACK} !important;
}

/* Hero — noir, texte blanc */
.gradient-hero {
  background-color: ${BLACK} !important;
  background-image: linear-gradient(
    180deg,
    ${BLACK} 0%,
    ${BLACK_DEEP} 50%,
    ${BLACK} 100%
  ) !important;
  color: ${WHITE} !important;
}

.gradient-shape-hero,
.gradient-shape-hero-flipped {
  background-image: none !important;
}

/* ── Cartes blanches sur fond noir ── */
.bg-stone-1100,
.rounded-\\[30px\\].bg-stone-1100,
.flex.flex-col.gap-stack-sm.rounded-\\[30px\\].border.border-stone-1000.bg-stone-1100 {
  background-color: ${WHITE} !important;
  border-color: ${BORDER_LIGHT} !important;
  color: ${BLACK} !important;
}

.bg-stone-1100 .text-white,
.bg-stone-1100 h1,
.bg-stone-1100 h2,
.bg-stone-1100 h3,
.bg-stone-1100 h4,
.bg-stone-1100 p,
.bg-stone-1100 li,
.bg-stone-1100 span:not([class*="text-icon"]):not([class*="text-primary"]) {
  color: ${BLACK} !important;
}

.bg-stone-1100 .text-stone-600,
.bg-stone-1100 .text-stone-700,
.bg-stone-1100 .text-stone-800,
.bg-stone-1100 .text-stone-900,
.bg-stone-1100 .text-muted {
  color: ${MUTED_CARD} !important;
}

/* Badges / pills sur cartes */
.border-stone-300,
.border-stone-400,
.border-stone-1000 {
  border-color: ${BORDER_LIGHT} !important;
}

.bg-stone-1100 .border-stone-1000 {
  border-color: ${BORDER_LIGHT} !important;
}

.inline-flex.items-center.rounded-full.border.border-stone-300.bg-stone-100 {
  background-color: #f5f5f5 !important;
  border-color: ${BORDER_LIGHT} !important;
  color: ${MUTED_CARD} !important;
}

/* Texte sur fond noir */
.text-stone-1100 {
  color: ${WHITE} !important;
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
  color: ${WHITE} !important;
}

/* Texte sur cartes blanches */
.bg-stone-1100 .text-stone-1100 {
  color: ${BLACK} !important;
}

/* ── Accents colorés Tenderbolt (petits détails uniquement) ── */
.text-primary,
.tabler-icon-check,
.tabler-icon-check.text-primary,
svg.text-primary {
  color: ${ACCENT_GREEN} !important;
}

.text-icon-purple {
  color: ${ACCENT_VIOLET} !important;
}

.text-icon-blue {
  color: ${ACCENT_BLUE} !important;
}

.text-icon-teal {
  color: ${ACCENT_BLUE} !important;
}

.text-icon-amber {
  color: ${ACCENT_ORANGE} !important;
}

.text-icon-lime {
  color: ${ACCENT_GREEN} !important;
}

.bg-icon-purple {
  background-color: ${ACCENT_VIOLET} !important;
}

.bg-icon-blue {
  background-color: ${ACCENT_BLUE} !important;
}

.bg-icon-teal {
  background-color: ${ACCENT_BLUE} !important;
}

.bg-icon-amber {
  background-color: ${ACCENT_ORANGE} !important;
}

.bg-icon-lime {
  background-color: ${ACCENT_GREEN} !important;
}

.bg-icon-purple\\/10 {
  background-color: rgba(124, 58, 237, 0.12) !important;
}

.bg-icon-blue\\/10 {
  background-color: rgba(37, 99, 235, 0.12) !important;
}

.bg-icon-teal\\/10 {
  background-color: rgba(37, 99, 235, 0.12) !important;
}

.bg-icon-amber\\/10 {
  background-color: rgba(234, 88, 12, 0.12) !important;
}

.bg-icon-lime\\/10 {
  background-color: rgba(22, 163, 74, 0.12) !important;
}

.bg-icon-purple\\/20 {
  background-color: rgba(124, 58, 237, 0.2) !important;
}

.bg-icon-blue\\/20 {
  background-color: rgba(37, 99, 235, 0.2) !important;
}

.bg-icon-teal\\/20 {
  background-color: rgba(37, 99, 235, 0.2) !important;
}

.bg-icon-amber\\/20 {
  background-color: rgba(234, 88, 12, 0.2) !important;
}

.bg-icon-lime\\/20 {
  background-color: rgba(22, 163, 74, 0.2) !important;
}

.text-emerald-100,
.text-moss {
  color: ${ACCENT_GREEN} !important;
}

.text-mustard-100,
.text-amber-100 {
  color: ${ACCENT_ORANGE} !important;
}

.text-gold,
.text-gold-100,
.text-purple-100,
.text-lazuli-200,
.text-lazuli-300 {
  color: ${ACCENT_BLUE} !important;
}

.bg-emerald-0 {
  background-color: rgba(22, 163, 74, 0.12) !important;
}

.bg-emerald-100 {
  background-color: ${ACCENT_GREEN} !important;
}

.bg-mustard-0,
.bg-amber-0 {
  background-color: rgba(234, 88, 12, 0.12) !important;
}

.bg-coral {
  background-color: #dc2626 !important;
}

.bg-lazuli-100 {
  background-color: rgba(37, 99, 235, 0.12) !important;
}

/* ── Cartes & ombres ── */
.shadow-card,
.shadow-sm,
.shadow-panel {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

/* ── Footer noir ── */
footer .bg-stone-1200,
footer .bg-stone-1300,
footer {
  background-color: ${BLACK_DEEP} !important;
}

footer .text-white,
.bg-stone-1300 .text-white {
  color: ${WHITE} !important;
}

/* ── Inputs ── */
input,
textarea,
select {
  border-color: ${BORDER_LIGHT} !important;
  background-color: ${WHITE} !important;
  color: ${BLACK} !important;
}

input:focus,
textarea:focus,
select:focus,
.focus\\:border-ember-100:focus {
  border-color: ${ACCENT_BLUE} !important;
  outline: 2px solid rgba(37, 99, 235, 0.2) !important;
  outline-offset: 0;
}

.placeholder\\:text-stone-600::placeholder {
  color: ${MUTED_CARD} !important;
}

/* ── Prose / tables (sur cartes blanches) ── */
.prose {
  color: ${BLACK} !important;
}

.prose a:hover {
  color: ${ACCENT_BLUE} !important;
}

.prose th {
  background-color: #f5f5f5 !important;
  color: ${BLACK} !important;
  border-color: ${BORDER_LIGHT} !important;
}

.prose td {
  border-color: ${BORDER_LIGHT} !important;
}

.prose tr:nth-child(odd) td {
  background-color: ${WHITE} !important;
}

.prose tr:nth-child(even) td {
  background-color: #fafafa !important;
}

.prose blockquote {
  background-color: #f5f5f5 !important;
  color: ${BLACK} !important;
}

.prose table {
  border-color: ${BORDER_LIGHT} !important;
}

/* ── Calculateur ROI ── */
#materia-roi-calc .mc-result {
  background: ${WHITE} !important;
  border: 1px solid ${BORDER_LIGHT} !important;
  color: ${BLACK} !important;
  border-radius: 8px !important;
}

#materia-roi-calc .mc-result::before {
  display: none !important;
}

#materia-roi-calc .mc-result-num span:first-child {
  color: ${ACCENT_BLUE} !important;
}

#materia-roi-calc .mc-result-label {
  color: ${MUTED_CARD} !important;
  opacity: 1 !important;
}

.rounded-\\[30px\\].bg-dark-orange-100 {
  background-color: ${WHITE} !important;
  border: 1px solid ${BORDER_LIGHT} !important;
  color: ${BLACK} !important;
}

/* Boutons CTA dans cartes blanches → noir */
.bg-stone-1100 .bg-ember-100,
.rounded-\\[30px\\] .bg-ember-100,
#materia-roi-calc .bg-ember-100 {
  background-color: ${BLACK} !important;
  color: ${WHITE} !important;
  border-color: ${BLACK} !important;
}

.bg-stone-1100 .bg-ember-100:hover,
.rounded-\\[30px\\] .bg-ember-100:hover,
#materia-roi-calc .bg-ember-100:hover {
  background-color: ${WHITE} !important;
  color: ${BLACK} !important;
  border-color: ${BLACK} !important;
}

/* ── Feature panels image ── */
article.grid .bg-lazuli-200 {
  background-color: #f5f5f5 !important;
  background-image: radial-gradient(
    circle,
    ${BORDER_LIGHT} 0.6px,
    transparent 0.6px
  ) !important;
  background-size: 22px 22px !important;
}

/* ── Decorative patterns — masqués ── */
[style*="mask-image:url(./materiabtp-assets/images/shape.svg)"],
[style*="-webkit-mask-image:url(./materiabtp-assets/images/shape.svg)"] {
  display: none !important;
}

svg[aria-hidden="true"]:has(path[d*="4396.1"]),
svg[aria-hidden="true"]:has(use[href="#_S_1_"]),
svg[aria-hidden="true"]:has(use[href^="#_R_"]) {
  display: none !important;
}

img[src*="wireframe-arrow"] {
  display: none !important;
}

svg[aria-hidden="true"].text-wireframe\\/70,
svg[aria-hidden="true"].text-wireframe-line\\/75 {
  display: none !important;
}

/* Hero checklist nowrap */
@media (min-width: 640px) {
  main > section:first-of-type ul.flex.flex-col > li > span.text-meta-lg {
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
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
console.log("Dark inverse palette applied (noir/blanc + accents Tenderbolt)");
