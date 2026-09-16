const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

/* AutogenAI theme.css — https://autogenai.com/ */
const INK = "#120f0d";
const NAVY = "#2b3c57";
const SKY = "#c5d8eb";
const PEACH = "#dbb59b";
const BODY = "#f6f1f0";
const BORDER = "#cec9c8";
const WHITE = "#ffffff";
const MUTED = "#6b6562";
const SUCCESS = "#4a6cfa";
const ERROR = "#da747b";
const WARNING = "#ffb700";

// index.html — calculateur ROI
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(
    /--mc-accent:var\(--color-dark-orange-100,#[0-9A-Fa-f]+\);--mc-accent-deep:var\(--color-ember-200,#[0-9A-Fa-f]+\);--mc-accent-soft:#[0-9A-Fa-f]+/,
    `--mc-accent:var(--color-dark-orange-100,${NAVY});--mc-accent-deep:var(--color-ember-200,${NAVY});--mc-accent-soft:${SKY}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-num span:first-child\{color:#[0-9A-Fa-f]+\}/,
    `#materia-roi-calc .mc-result-num span:first-child{color:${NAVY}}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result\{background:#[0-9A-Fa-f]+[^}]*\}/,
    `#materia-roi-calc .mc-result{background:${WHITE};border:1px solid ${BORDER};color:${INK}}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-label\{color:#[0-9A-Fa-f]+[^}]*\}/,
    `#materia-roi-calc .mc-result-label{color:${MUTED};opacity:1}`,
  )
  .replace(
    /box-shadow:0 1px 3px rgba\([^)]+\)/g,
    "box-shadow:0 1px 3px rgba(43,60,87,.12)",
  );
fs.writeFileSync(path.join(root, "index.html"), html);

const cssPath = path.join(root, "materiabtp-assets", "materia-design-system.css");
let css = fs.readFileSync(cssPath, "utf8");

css = css.replace(
  /Enterprise B2B · Inter · [^·]+ · blanc dominant/,
  "Enterprise B2B · Inter · AutogenAI palette · blanc dominant",
);

// Replace :root block
css = css.replace(
  /:root \{[\s\S]*?\n\}/,
  `:root {
  /* AutogenAI palette — https://autogenai.com/ */
  --color-primary: ${NAVY};
  --color-foreground: ${INK};
  --color-background: ${BODY};
  --color-border: ${BORDER};
  --color-muted: ${MUTED};
  --color-surface: ${WHITE};

  /* Brand aliases (legacy token names) */
  --color-ember-0: ${SKY};
  --color-ember-50: ${NAVY};
  --color-ember-100: ${SKY};
  --color-ember-200: ${NAVY};
  --color-dark-orange-100: ${SKY};
  --color-dark-orange-200: ${NAVY};
  --color-lazuli-0: ${BODY};
  --color-lazuli-100: ${SKY};
  --color-lazuli-200: ${NAVY};
  --color-lazuli-300: ${NAVY};
  --color-purple-0: ${BODY};
  --color-purple-100: ${NAVY};
  --color-gold: ${NAVY};
  --color-gold-0: ${BODY};
  --color-gold-100: ${NAVY};
  --color-mustard-0: #fff8e6;
  --color-mustard-100: ${WARNING};
  --color-amber-0: #fff8e6;
  --color-amber-100: ${WARNING};
  --color-emerald-0: #eef2ff;
  --color-emerald-100: ${SUCCESS};
  --color-teal-0: ${BODY};
  --color-teal-100: ${NAVY};
  --color-coral: ${ERROR};
  --color-moss: ${SUCCESS};

  /* Icon tints */
  --color-icon-purple: ${NAVY};
  --color-icon-amber: ${WARNING};
  --color-icon-teal: ${NAVY};
  --color-icon-lime: ${SUCCESS};
  --color-icon-blue: ${NAVY};

  /* Neutrals — warm AutogenAI body */
  --color-stone-100: ${BODY};
  --color-stone-200: ${BODY};
  --color-stone-300: ${BORDER};
  --color-stone-400: ${BORDER};
  --color-stone-500: #b8b3b2;
  --color-stone-600: ${MUTED};
  --color-stone-700: ${MUTED};
  --color-stone-800: #4a4543;
  --color-stone-900: #2e2a28;
  --color-stone-1000: ${BORDER};
  --color-stone-1100: ${INK};
  --color-stone-1200: ${WHITE};
  --color-stone-1300: ${INK};
  --color-sand-0: ${BODY};
  --color-sand-100: ${BORDER};
  --color-wireframe: ${MUTED};
  --color-wireframe-line: #a8a29e;

  /* Typography */
  --font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --font-body: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --font-display: Inter, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}`,
);

// Remove old monochrome CTA block at end if present
css = css.replace(
  /\n\/\* Monochrome — CTA texte blanc sur fond encre \*\/[\s\S]*$/,
  "",
);

// Append AutogenAI-specific overrides
css += `
/* AutogenAI — boutons primaires : fond sky, texte encre, hover navy */
.bg-ember-100,
.bg-dark-orange-100,
.bg-lazuli-200,
header .bg-ember-100,
header a.bg-ember-100 {
  background-color: ${SKY} !important;
  color: ${INK} !important;
  border: 1px solid ${SKY} !important;
}

.hover\\:bg-ember-200:hover,
.bg-dark-orange-200,
.bg-lazuli-300,
header .bg-ember-100:hover,
header a.bg-ember-100:hover,
header .hover\\:bg-ember-200:hover,
.hover\\:bg-stone-1100:hover {
  background-color: ${NAVY} !important;
  color: ${WHITE} !important;
  border-color: ${NAVY} !important;
}

.text-primary,
.text-ember-100,
.text-lazuli-200,
.text-lazuli-300 {
  color: ${NAVY} !important;
}

.text-gold,
.text-gold-100,
.text-purple-100 {
  color: ${NAVY} !important;
}

/* Checkmarks / icônes — navy AutogenAI */
.text-primary,
.tabler-icon-check,
.tabler-icon-check.text-primary,
svg.text-primary {
  color: ${NAVY} !important;
}

/* Body warm background */
body {
  background-color: ${BODY} !important;
  color: ${INK} !important;
}

/* Hero gradient — navy AutogenAI */
.gradient-hero {
  background-image: linear-gradient(
    180deg,
    ${NAVY} 8%,
    #1a2840 52%,
    ${INK} 96%
  ) !important;
}

/* Footer — noir AutogenAI */
footer .bg-stone-1200,
footer .bg-stone-1300,
.bg-stone-1100,
.bg-stone-1300 {
  background-color: #000000 !important;
}

/* Inputs focus — navy */
input:focus,
textarea:focus,
select:focus,
.focus\\:border-ember-100:focus {
  border-color: ${NAVY} !important;
  outline: 2px solid rgba(43, 60, 87, 0.15) !important;
}

/* Icon backgrounds — sky tint */
.bg-icon-purple,
.bg-icon-blue,
.bg-icon-teal {
  background-color: ${NAVY} !important;
}

.bg-icon-purple\\/10,
.bg-icon-blue\\/10,
.bg-icon-teal\\/10 {
  background-color: rgba(197, 216, 235, 0.45) !important;
}

.bg-icon-purple\\/20,
.bg-icon-blue\\/20,
.bg-icon-teal\\/20 {
  background-color: rgba(197, 216, 235, 0.65) !important;
}

.text-icon-purple,
.text-icon-blue,
.text-icon-teal {
  color: ${NAVY} !important;
}

.text-emerald-100,
.text-moss {
  color: ${SUCCESS} !important;
}

.bg-emerald-100 {
  background-color: ${SUCCESS} !important;
}

.bg-coral {
  background-color: ${ERROR} !important;
}

.text-mustard-100,
.text-amber-100,
.text-icon-amber {
  color: ${WARNING} !important;
}

/* Calculateur ROI */
#materia-roi-calc .mc-result {
  background: ${WHITE} !important;
  border: 1px solid ${BORDER} !important;
  color: ${INK} !important;
}

#materia-roi-calc .mc-result-num span:first-child {
  color: ${NAVY} !important;
}

#materia-roi-calc .mc-result-label {
  color: ${MUTED} !important;
}

.rounded-\\[30px\\].bg-dark-orange-100 {
  background-color: ${BODY} !important;
  border: 1px solid ${BORDER} !important;
}

/* Feature panels — fond sky très léger */
article.grid .bg-lazuli-200 {
  background-color: ${BODY} !important;
  background-image: radial-gradient(
    circle,
    ${BORDER} 0.6px,
    transparent 0.6px
  ) !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log("AutogenAI palette applied");
