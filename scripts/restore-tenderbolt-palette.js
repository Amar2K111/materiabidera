const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const cssPath = path.join(root, "materiabtp-assets", "materia-design-system.css");

let html = fs.readFileSync(indexPath, "utf8");

// 1. Retirer l'override MateriaBTP (les styles Tenderbolt sont dans le CSS embarqué)
html = html.replace(
  /<link rel="stylesheet" href="\.\/materiabtp-assets\/materia-design-system\.css"\/>/,
  "",
);

// 2. Tokens Materia → tokens Tenderbolt d'origine
html = html.replace(
  /--color-primary:#155EEF;--color-background:#fff;--color-foreground:#0F172A;--color-border:#c9d1d8;--color-ember-0:#EFF6FF;--color-ember-50:#4d74c4;--color-ember-100:#155EEF;--color-ember-200:#0B3B8F;--color-dark-orange-100:#155EEF;--color-dark-orange-200:#0B3B8F;/,
  "--color-primary:#0035A9;--color-background:#fff;--color-foreground:#181d34;--color-border:#c9d1d8;--color-ember-0:#eef2fb;--color-ember-50:#3580d4;--color-ember-100:#0035A9;--color-ember-200:#002a85;--color-dark-orange-100:#3580d4;--color-dark-orange-200:#002a85;",
);

// Variantes partielles si le bloc a divergé
html = html
  .replace(/--color-ember-100:#155EEF/g, "--color-ember-100:#0035A9")
  .replace(/--color-ember-200:#0B3B8F/g, "--color-ember-200:#002a85")
  .replace(/--color-dark-orange-100:#155EEF/g, "--color-dark-orange-100:#3580d4")
  .replace(/--color-dark-orange-200:#0B3B8F/g, "--color-dark-orange-200:#002a85")
  .replace(/--color-primary:#155EEF/g, "--color-primary:#0035A9")
  .replace(/--color-ember-0:#EFF6FF/g, "--color-ember-0:#eef2fb");

// 3. Logo clair dans le header sombre Tenderbolt
html = html.replace(
  /<header[\s\S]*?<\/header>/,
  (header) =>
    header.replace(
      /logo-materiabtp-wordmark\.png/g,
      "logo-materiabtp-wordmark-light.png",
    ),
);

html = html.replace(
  /preload" as="image" href="\.\/materiabtp-assets\/images\/logo-materiabtp-wordmark\.png"/,
  'preload" as="image" href="./materiabtp-assets/images/logo-materiabtp-wordmark-light.png"',
);

fs.writeFileSync(indexPath, html);

// 4. Désactiver le fichier override (ne plus charger)
fs.writeFileSync(
  cssPath,
  `/* Désactivé — styles Tenderbolt d'origine via CSS embarqué dans index.html */\n`,
);

console.log("Tenderbolt palette & style restored (override CSS removed)");
