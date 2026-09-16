const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// index.html — calculateur
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(
    "--mc-accent:var(--color-dark-orange-100,#1E4D7B);--mc-accent-deep:var(--color-ember-200,#163A5F);--mc-accent-soft:#E8EEF4",
    "--mc-accent:var(--color-dark-orange-100,#1E40AF);--mc-accent-deep:var(--color-ember-200,#1E3A8A);--mc-accent-soft:#F5F5F4",
  )
  .replace(/#f4f6f8/gi, "#fafaf9")
  .replace(/#dde2e8/gi, "#e7e5e4")
  .replace(/#0f1419/gi, "#1c1917")
  .replace(/#1e4d7b/gi, "#1e40af")
  .replace(/#5c6670/gi, "#78716c");
fs.writeFileSync(path.join(root, "index.html"), html);

// CSS global
const cssPath = path.join(root, "materiabtp-assets", "materia-design-system.css");
let css = fs.readFileSync(cssPath, "utf8");

css = css.replace(
  "Enterprise B2B · Inter · Navy Ingénierie · blanc dominant",
  "Enterprise B2B · Inter · Papier & Encre · blanc dominant",
);

const swaps = [
  ["#1e4d7b", "#1e40af"],
  ["#1E4D7B", "#1E40AF"],
  ["#163a5f", "#1e3a8a"],
  ["#163A5F", "#1E3A8A"],
  ["#0f1419", "#1c1917"],
  ["#0F1419", "#1C1917"],
  ["#5c6670", "#78716c"],
  ["#5C6670", "#78716C"],
  ["#f4f6f8", "#fafaf9"],
  ["#F4F6F8", "#FAFAF9"],
  ["#dde2e8", "#e7e5e4"],
  ["#DDE2E8", "#E7E5E4"],
  ["#e8eef4", "#f5f5f4"],
  ["#E8EEF4", "#F5F5F4"],
  ["#4a7cab", "#2563eb"],
  ["#d4e0ec", "#e7e5e4"],
  ["#243b53", "#292524"],
  ["#f1f5f9", "#f5f5f4"],
  ["#cbd5e1", "#d6d3d1"],
  ["#94a3b8", "#a8a29e"],
  ["#475569", "#57534e"],
  ["#334155", "#44403c"],
];

for (const [from, to] of swaps) {
  css = css.split(from).join(to);
}

// Neutrals stone — chauds (commentaire)
css = css.replace(
  "/* Neutrals — slate instead of warm stone */",
  "/* Neutrals — stone chaud (Papier & Encre) */",
);

fs.writeFileSync(cssPath, css);
console.log("Papier & Encre palette applied");
