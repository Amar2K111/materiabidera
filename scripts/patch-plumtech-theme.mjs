import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.join(import.meta.dirname, "..");
const indexPath = path.join(root, "index.html");
const brandPath = path.join(root, "materiabtp-assets", "materia-brand-alignment.css");
const themePath = path.join(root, "materiabtp-assets", "materia-plumtech-theme.css");

/** Palette logo MateriaBTP */
const LOGO = {
  primary: "#0035a9",
  deep: "#002a85",
  accent: "#3580d4",
  sky: "#5ba3e8",
  ink: "#001830",
  wash: "#eef2fb",
  mist: "#d4e3f6",
};

let html = fs.readFileSync(indexPath, "utf8");

const themeLink =
  '<link rel="stylesheet" href="./materiabtp-assets/materia-plumtech-theme.css"/>';

if (!html.includes("materia-plumtech-theme.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>',
    `<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>${themeLink}`,
  );
}

/** Normalise toute variante (PlumTech ou anciennes) vers la palette logo */
const toLogo = [
  ["#16335e", LOGO.primary],
  ["#16335E", LOGO.primary.toUpperCase()],
  ["#0b1b33", LOGO.deep],
  ["#0B1B33", LOGO.deep.toUpperCase()],
  ["#1e4d8c", LOGO.accent],
  ["#1E4D8C", LOGO.accent.toUpperCase()],
  ["#2e86e6", LOGO.accent],
  ["#2E86E6", LOGO.accent.toUpperCase()],
  ["#7eb8f5", LOGO.sky],
  ["#7EB8F5", LOGO.sky.toUpperCase()],
  ["#f4f7fb", LOGO.wash],
  ["#F4F7FB", LOGO.wash.toUpperCase()],
  ["#eaf1fa", LOGO.wash],
  ["#EAF1FA", LOGO.wash.toUpperCase()],
  ["#e6eef7", LOGO.mist],
  ["#E6EEF7", LOGO.mist.toUpperCase()],
  ["#d4e6f7", LOGO.mist],
  ["#181d34", LOGO.ink],
];

for (const [from, to] of toLogo) {
  html = html.split(from).join(to);
}

html = html.replace(
  /--color-primary:#[0-9a-fA-F]{3,8}/,
  `--color-primary:${LOGO.primary}`,
);
html = html.replace(
  /--color-foreground:#[0-9a-fA-F]{3,8}/,
  `--color-foreground:${LOGO.ink}`,
);
html = html.replace(
  /--color-ember-100:#[0-9a-fA-F]{3,8}/,
  `--color-ember-100:${LOGO.primary}`,
);
html = html.replace(
  /--color-ember-200:#[0-9a-fA-F]{3,8}/,
  `--color-ember-200:${LOGO.deep}`,
);
html = html.replace(
  /--color-ember-50:#[0-9a-fA-F]{3,8}/,
  `--color-ember-50:${LOGO.accent}`,
);
html = html.replace(
  /--color-dark-orange-100:#[0-9a-fA-F]{3,8}/,
  `--color-dark-orange-100:${LOGO.accent}`,
);
html = html.replace(
  /--color-dark-orange-200:#[0-9a-fA-F]{3,8}/,
  `--color-dark-orange-200:${LOGO.deep}`,
);
html = html.replace(
  /--color-lazuli-200:#[0-9a-fA-F]{3,8}/,
  `--color-lazuli-200:${LOGO.accent}`,
);
html = html.replace(
  /--color-lazuli-300:#[0-9a-fA-F]{3,8}/,
  `--color-lazuli-300:${LOGO.primary}`,
);
html = html.replace(
  /--color-icon-blue:#[0-9a-fA-F]{3,8}/,
  `--color-icon-blue:${LOGO.sky}`,
);

/** Gris Tailwind trop clairs → contrastes lisibles (WCAG AA) */
html = html.replace(
  /--color-stone-1200:#[0-9a-fA-F]{3,8}/,
  `--color-stone-1200:${LOGO.ink}`,
);
html = html.replace(
  /--color-stone-900:#[0-9a-fA-F]{3,8}/,
  `--color-stone-900:${LOGO.ink}`,
);
html = html.replace(
  /--color-stone-800:#[0-9a-fA-F]{3,8}/,
  `--color-stone-800:${LOGO.primary}`,
);
html = html.replace(
  /--color-stone-700:#[0-9a-fA-F]{3,8}/,
  `--color-stone-700:${LOGO.accent}`,
);
html = html.replace(
  /--color-stone-600:#[0-9a-fA-F]{3,8}/,
  `--color-stone-600:${LOGO.sky}`,
);

/** Surfaces & neutrals → palette logo (fini le beige/gris stone) */
const inlineTokens = {
  "--color-stone-100": LOGO.wash,
  "--color-stone-200": "#e8eef9",
  "--color-stone-300": LOGO.mist,
  "--color-stone-400": "#c5d9f0",
  "--color-stone-500": "#b8cfe8",
  "--color-stone-1000": LOGO.deep,
  "--color-stone-1100": LOGO.ink,
  "--color-stone-1300": LOGO.ink,
  "--color-sand-0": LOGO.wash,
  "--color-sand-100": LOGO.mist,
  "--color-border": "#c5d9f0",
  "--color-lazuli-0": LOGO.wash,
  "--color-lazuli-100": LOGO.mist,
  "--color-teal-0": LOGO.mist,
  "--color-teal-100": LOGO.accent,
  "--color-emerald-0": LOGO.mist,
  "--color-emerald-100": LOGO.primary,
  "--color-amber-0": LOGO.mist,
  "--color-amber-100": LOGO.accent,
  "--color-gold-0": LOGO.mist,
  "--color-gold-100": LOGO.deep,
  "--color-gold": LOGO.primary,
  "--color-purple-0": LOGO.wash,
  "--color-purple-100": LOGO.primary,
  "--color-mustard-0": LOGO.mist,
  "--color-mustard-100": LOGO.deep,
  "--color-moss": LOGO.accent,
  "--color-coral": LOGO.primary,
  "--color-icon-amber": LOGO.accent,
  "--color-icon-purple": LOGO.primary,
  "--color-icon-teal": LOGO.deep,
  "--color-icon-lime": LOGO.sky,
  "--color-icon-peach": LOGO.accent,
};

for (const [name, value] of Object.entries(inlineTokens)) {
  html = html.replace(
    new RegExp(`${name.replace(/-/g, "\\-")}:#[0-9a-fA-F]{3,8}`, "i"),
    `${name}:${value}`,
  );
}

/** Calculateur ROI — fallbacks stone → logo */
html = html.replace(/--mc-track:#e7e5e4/g, `--mc-track:${LOGO.mist}`);
html = html.replace(/#292524/g, LOGO.primary);
html = html.replace(/#1c1917/g, LOGO.ink);
html = html.replace(/#57534e/g, LOGO.accent);
html = html.replace(/#f5f5f4/g, LOGO.wash);
html = html.replace(/rgba\(26,23,16/g, "rgba(0,53,169");
html = html.replace(/rgba\(28,25,23/g, "rgba(0,53,169");
html = html.replace(/#071a4526/g, "rgba(0,53,169,0.15)");
html = html.replace(/#fafbf8/gi, LOGO.wash);
html = html.replace(/#f4f2ed/gi, LOGO.wash);
html = html.replace(/#353532/gi, LOGO.ink);
html = html.replace(/#272721/gi, LOGO.ink);
html = html.replace(/#44403c/gi, LOGO.primary);
html = html.replace(/#c9d1d8/gi, "#c5d9f0");

/** Typo corporate — Inter Tight partout (titres + corps) */
html = html.replace(
  /--font-sans:"Mona Sans", "Montserrat", ui-sans-serif, system-ui, sans-serif/,
  '--font-sans:"Inter Tight", ui-sans-serif, system-ui, sans-serif',
);
html = html.replace(
  /--font-display:"GT Super Display", ui-serif, Georgia, serif/,
  '--font-display:"Inter Tight", ui-sans-serif, system-ui, sans-serif',
);
html = html.replace(
  /body\{background-color:var\(--color-background\);color:var\(--color-foreground\);font-family:var\(--font-sans\)/,
  "body{background-color:var(--color-background);color:var(--color-foreground);font-family:var(--font-body)",
);

const heroGradient = `.gradient-hero{background-image:radial-gradient(circle at 70% 20%,${LOGO.accent} 0%,${LOGO.primary} 55%,${LOGO.deep} 100%)}`;

html = html.replace(/\.gradient-hero\{background-image:[^}]+\}/, heroGradient);

html = html.replace(
  /logo-materiabtp-wordmark-on-dark\.png/g,
  "logo-materiabtp-wordmark.png",
);

fs.writeFileSync(indexPath, html);

const brandRoot = `:root {
  --mb-ink: ${LOGO.ink};
  --mb-primary: ${LOGO.primary};
  --mb-primary-deep: ${LOGO.deep};
  --mb-accent: ${LOGO.accent};
  --mb-sky: ${LOGO.sky};
  --mb-body: ${LOGO.primary};
  --mb-muted: ${LOGO.accent};
  --mb-subtle: ${LOGO.sky};
  --mb-surface: ${LOGO.wash};
  --mb-mist: ${LOGO.mist};
  --mb-wash: ${LOGO.wash};
  --mb-primary-rgb: 0, 53, 169;

  --color-stone-1200: var(--mb-ink);
  --color-stone-900: var(--mb-ink);
  --color-stone-800: var(--mb-body);
  --color-stone-700: var(--mb-muted);
  --color-stone-600: var(--mb-subtle);

  --font-display: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-body);

  --color-primary: var(--mb-primary);
  --color-ember-0: var(--mb-wash);
  --color-ember-50: var(--mb-accent);
  --color-ember-100: var(--mb-primary);
  --color-ember-200: var(--mb-primary-deep);
  --color-dark-orange-100: var(--mb-accent);
  --color-dark-orange-200: var(--mb-primary-deep);
  --color-lazuli-0: var(--mb-wash);
  --color-lazuli-100: var(--mb-mist);
  --color-lazuli-200: var(--mb-accent);
  --color-lazuli-300: var(--mb-primary);
  --color-icon-blue: var(--mb-sky);
  --color-icon-amber: var(--mb-accent);
  --color-icon-purple: var(--mb-primary);
  --color-icon-teal: var(--mb-primary-deep);
  --color-icon-lime: var(--mb-sky);
  --color-icon-peach: var(--mb-accent);
}`;

let brand = fs.readFileSync(brandPath, "utf8");
brand = brand.replace(
  /\/\* MateriaBTP — [^*]+ \*\//,
  "/* MateriaBTP — design PlumTech + palette logo (#0035A9) */",
);
brand = brand.replace(/:root \{[\s\S]*?\}/, brandRoot);
fs.writeFileSync(brandPath, brand);

if (!fs.existsSync(themePath)) {
  console.warn("materia-plumtech-theme.css missing — create it first");
}

spawnSync(process.execPath, [path.join(import.meta.dirname, "patch-plumtech-cards.mjs")], {
  stdio: "inherit",
});

console.log("PlumTech layout + MateriaBTP logo palette applied");
