import fs from "node:fs";

const indexPath = new URL("../index.html", import.meta.url);
let html = fs.readFileSync(indexPath, "utf8");

html = html.replace(
  /<link rel="preload" href="\.\/materiabtp-assets\/fonts\/MonaSans-VariableFont\.woff2"[^>]*\/>/g,
  "",
);
html = html.replace(
  /<link rel="preload" href="\.\/materiabtp-assets\/fonts\/InterTight-VariableFont\.woff2"[^>]*\/>/g,
  "",
);
html = html.replace(
  /<link rel="preload" href="\.\/materiabtp-assets\/fonts\/GT-Super-Display-Bold\.woff2"[^>]*\/>/g,
  "",
);
html = html.replace(/materia-brand-alignment\.css\?v=\d+/g, "materia-brand-alignment.css?v=5");
html = html.replace(/materia-plumtech-theme\.css\?v=\d+/g, "materia-plumtech-theme.css?v=5");

fs.writeFileSync(indexPath, html);
console.log("index.html typography cache patch applied");
