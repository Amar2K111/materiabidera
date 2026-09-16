const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const INK = "#1c1917";
const INK_DEEP = "#0a0a0a";
const INK_MID = "#44403c";
const MUTED = "#78716c";
const SURFACE = "#fafaf9";
const BORDER = "#e7e5e4";
const WASH = "#f5f5f4";

// index.html — calculateur
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(
    /--mc-accent:var\(--color-dark-orange-100,#[0-9A-Fa-f]+\);--mc-accent-deep:var\(--color-ember-200,#[0-9A-Fa-f]+\);--mc-accent-soft:#[0-9A-Fa-f]+/,
    `--mc-accent:var(--color-dark-orange-100,${INK});--mc-accent-deep:var(--color-ember-200,${INK_DEEP});--mc-accent-soft:${WASH}`,
  )
  .replace(
    /#materia-roi-calc \.mc-result-num span:first-child\{color:#[0-9A-Fa-f]+\}/,
    `#materia-roi-calc .mc-result-num span:first-child{color:${INK}}`,
  )
  .replace(
    /box-shadow:0 1px 3px rgba\(11,59,143[^)]+\)/g,
    "box-shadow:0 1px 3px rgba(28,25,23,.12)",
  );
fs.writeFileSync(path.join(root, "index.html"), html);

// CSS
const cssPath = path.join(root, "materiabtp-assets", "materia-design-system.css");
let css = fs.readFileSync(cssPath, "utf8");

css = css.replace(
  /Enterprise B2B · Inter · [^·]+ · blanc dominant/,
  "Enterprise B2B · Inter · Monochrome · blanc dominant",
);

// :root brand tokens
css = css.replace(/--color-primary: [^;]+;/, `--color-primary: ${INK};`);
css = css.replace(/--color-ember-50: [^;]+;/, `--color-ember-50: ${INK_MID};`);
css = css.replace(/--color-ember-100: [^;]+;/g, `--color-ember-100: ${INK};`);
css = css.replace(/--color-ember-200: [^;]+;/g, `--color-ember-200: ${INK_DEEP};`);
css = css.replace(
  /--color-dark-orange-100: [^;]+;/g,
  `--color-dark-orange-100: ${INK};`,
);
css = css.replace(
  /--color-dark-orange-200: [^;]+;/g,
  `--color-dark-orange-200: ${INK_DEEP};`,
);
css = css.replace(/--color-lazuli-200: [^;]+;/g, `--color-lazuli-200: ${INK};`);
css = css.replace(
  /--color-lazuli-300: [^;]+;/g,
  `--color-lazuli-300: ${INK_DEEP};`,
);
css = css.replace(
  /--color-purple-100: [^;]+;/g,
  `--color-purple-100: ${INK};`,
);
css = css.replace(/--color-gold: [^;]+;/g, `--color-gold: ${INK};`);
css = css.replace(
  /--color-gold-100: [^;]+;/g,
  `--color-gold-100: ${INK_DEEP};`,
);
css = css.replace(
  /--color-teal-100: [^;]+;/g,
  `--color-teal-100: ${INK};`,
);
css = css.replace(
  /--color-icon-purple: [^;]+;/g,
  `--color-icon-purple: ${INK_MID};`,
);
css = css.replace(
  /--color-icon-teal: [^;]+;/g,
  `--color-icon-teal: ${INK_MID};`,
);
css = css.replace(
  /--color-icon-blue: [^;]+;/g,
  `--color-icon-blue: ${INK_MID};`,
);

css = css.replace(
  "/* Icon tints — unified blue / functional */",
  "/* Icon tints — monochrome + functional */",
);

const blueHex = [
  "#1e40af",
  "#1E40AF",
  "#1e3a8a",
  "#1E3A8A",
  "#2563eb",
  "#155eef",
  "#155EEF",
  "#0b3b8f",
  "#5b8ff5",
];
for (const hex of blueHex) {
  const lower = hex.toLowerCase();
  css = css.split(hex).join(INK);
  if (lower !== hex) css = css.split(lower).join(INK);
}

// hover states that became INK need INK_DEEP
css = css.replace(
  /background-color: #1c1917 !important;\s*\n\}/g,
  "background-color: #1c1917 !important;\n}",
);
css = css.replace(
  /\.hover\\:bg-ember-200:hover,\n\.bg-dark-orange-200,\n\.bg-lazuli-300,\n\.hover\\:bg-stone-1100:hover \{\n  background-color: #1c1917 !important;/,
  `.hover\\:bg-ember-200:hover,\n.bg-dark-orange-200,\n.bg-lazuli-300,\n.hover\\:bg-stone-1100:hover {\n  background-color: ${INK_DEEP} !important;`,
);

css = css.replace(
  /header \.bg-ember-100:hover,\nheader a\.bg-ember-100:hover,\nheader \.hover\\:bg-ember-200:hover \{\n  background-color: #1c1917 !important;/,
  `header .bg-ember-100:hover,\nheader a.bg-ember-100:hover,\nheader .hover\\:bg-ember-200:hover {\n  background-color: ${INK_DEEP} !important;`,
);

css = css.replace(
  /\.prose a:hover \{\n  color: #1c1917 !important;/,
  `.prose a:hover {\n  color: ${INK_DEEP} !important;`,
);

css = css.replace(/rgba\(21, 94, 239, 0\.08\)/g, "rgba(28, 25, 23, 0.06)");
css = css.replace(/rgba\(21, 94, 239, 0\.12\)/g, "rgba(28, 25, 23, 0.1)");
css = css.replace(/rgba\(21, 94, 239, 0\.15\)/g, "rgba(28, 25, 23, 0.12)");

css = css.replace(
  "/* Icon backgrounds — subtle blue tints */",
  "/* Icon backgrounds — monochrome */",
);
css = css.replace(
  /\.bg-icon-purple,\n\.bg-icon-blue,\n\.bg-icon-teal \{\n  background-color: #1c1917 !important;/,
  `.bg-icon-purple,\n.bg-icon-blue,\n.bg-icon-teal {\n  background-color: ${INK_MID} !important;`,
);

css = css.replace(
  /\.text-icon-purple,\n\.text-icon-blue,\n\.text-icon-teal \{\n  color: #1c1917 !important;/,
  `.text-icon-purple,\n.text-icon-blue,\n.text-icon-teal {\n  color: ${INK_MID} !important;`,
);

css = css.replace(
  /#materia-roi-calc \.mc-result-num span:first-child \{\n  color: #1c1917 !important;/,
  `#materia-roi-calc .mc-result-num span:first-child {\n  color: ${INK} !important;`,
);

// CTA text always white on dark buttons
css += `
/* Monochrome — CTA texte blanc sur fond encre */
.bg-ember-100,
.bg-dark-orange-100,
.bg-lazuli-200,
header .bg-ember-100,
header a.bg-ember-100 {
  color: #ffffff !important;
}

.text-primary,
.text-ember-100,
.text-lazuli-200 {
  color: ${INK} !important;
}

/* Checkmarks / liens actifs sans bleu */
.text-lazuli-200 svg,
.text-primary svg,
[class*="text-ember"] svg {
  color: inherit;
}
`;

fs.writeFileSync(cssPath, css);
console.log("Monochrome palette (A) applied");
