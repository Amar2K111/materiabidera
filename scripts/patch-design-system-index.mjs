import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const newPaletteFix = `<style id="materia-palette-fix">
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
:root{
  --color-primary:#155EEF;
  --color-foreground:#0F172A;
  --color-background:#FFFFFF;
  --color-border:#E2E8F0;
  --color-ember-0:#EFF6FF;
  --color-ember-50:#5B8FF5;
  --color-ember-100:#155EEF;
  --color-ember-200:#0B3B8F;
  --color-dark-orange-100:#EFF6FF;
  --color-dark-orange-200:#0B3B8F;
  --color-lazuli-0:#EFF6FF;
  --color-lazuli-100:#DBEAFE;
  --color-lazuli-200:#155EEF;
  --color-lazuli-300:#0B3B8F;
  --color-purple-0:#EFF6FF;
  --color-purple-100:#0B3B8F;
  --color-icon-purple:#155EEF;
  --font-sans:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --font-body:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --font-display:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
html,body,.font-body,.font-display,.font-sans{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
.text-primary{color:#155EEF!important}
.bg-ember-100{background-color:#155EEF!important}
.hover\\:bg-ember-200:hover{background-color:#0B3B8F!important}
.bg-dark-orange-100{background-color:#EFF6FF!important}
.bg-dark-orange-200{background-color:#0B3B8F!important}
.bg-lazuli-200{background-color:#155EEF!important}
.bg-lazuli-300{background-color:#0B3B8F!important}
.text-lazuli-200{color:#155EEF!important}
@media (min-width:640px){
  main>section:first-of-type ul.flex.flex-col>li>span.text-meta-lg{white-space:nowrap}
}
</style>`;

const paletteStart = html.indexOf('<style id="materia-palette-fix">');
const paletteEnd = html.indexOf("</style>", paletteStart) + 8;
if (paletteStart === -1) throw new Error("materia-palette-fix not found");
html = html.slice(0, paletteStart) + newPaletteFix + html.slice(paletteEnd);

const colorReplacements = [
  ["#0035a9", "#155EEF"],
  ["#0035A9", "#155EEF"],
  ["#002a85", "#0B3B8F"],
  ["#002A85", "#0B3B8F"],
  ["#3580d4", "#155EEF"],
  ["#1a46b0", "#155EEF"],
  ["#181d34", "#0F172A"],
  ["#eef2fb", "#EFF6FF"],
  ["#e8f1fa", "#EFF6FF"],
  ["rgba(0, 53, 169, 0.06)", "rgba(21, 94, 239, 0.08)"],
  ["rgba(0, 53, 169, 0.22)", "rgba(21, 94, 239, 0.22)"],
  ["rgba(0,42,133,", "rgba(11,59,143,"],
  ["#fe6111", "#155EEF"],
  ["#0f7a4a", "#16A34A"],
  ["#a96200", "#D97706"],
  ["#b3261e", "#DC2626"],
];

for (const [from, to] of colorReplacements) {
  html = html.split(from).join(to);
}

html = html.replace(
  /--mc-accent:var\(--color-dark-orange-100,#155EEF\)/,
  "--mc-accent:var(--color-dark-orange-100,#155EEF)",
);
html = html.replace(
  /--mc-accent-deep:var\(--color-dark-orange-200,#0B3B8F\)/,
  "--mc-accent-deep:var(--color-ember-200,#0B3B8F)",
);
html = html.replace(
  /--mc-accent-soft:#EFF6FF/,
  "--mc-accent-soft:#EFF6FF",
);
html = html.replace(
  /#materia-roi-calc \.mc-result\{[^}]+background:var\(--mc-accent\)/,
  (m) => m.replace("background:var(--mc-accent)", "background:#155EEF"),
);

fs.writeFileSync("index.html", html);
console.log("index.html design system patched");
