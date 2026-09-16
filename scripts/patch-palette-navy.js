const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// index.html — calculateur ROI
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(
    "--mc-accent:var(--color-dark-orange-100,#155EEF);--mc-accent-deep:var(--color-ember-200,#0B3B8F);--mc-accent-soft:#EFF6FF",
    "--mc-accent:var(--color-dark-orange-100,#1E4D7B);--mc-accent-deep:var(--color-ember-200,#163A5F);--mc-accent-soft:#E8EEF4",
  )
  .replace(
    /#materia-roi-calc \.mc-field\{[^}]+background:#f5f5f4/,
    (m) => m.replace("#f5f5f4", "#f4f6f8"),
  )
  .replace(
    /#materia-roi-calc \.mc-label\{[^}]+color:#292524/,
    (m) => m.replace("#292524", "#0f1419"),
  )
  .replace(
    /#materia-roi-calc \.mc-result\{[^}]+\}/,
    "#materia-roi-calc .mc-result{position:relative;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:clamp(.25rem,1.2cqi,.375rem);padding:clamp(.625rem,4cqi,1.25rem);border-radius:8px;background:#f4f6f8;border:1px solid #dde2e8;color:#0f1419;text-align:center}",
  )
  .replace(
    "#materia-roi-calc .mc-result-num span:first-child{color:#155eef}",
    "#materia-roi-calc .mc-result-num span:first-child{color:#1e4d7b}",
  )
  .replace(
    "#materia-roi-calc .mc-result-label{color:#64748b",
    "#materia-roi-calc .mc-result-label{color:#5c6670",
  );
fs.writeFileSync(path.join(root, "index.html"), html);

// materia-design-system.css — remplacement global
const cssPath = path.join(root, "materiabtp-assets", "materia-design-system.css");
let css = fs.readFileSync(cssPath, "utf8");

css = css.replace(
  "Enterprise B2B · Inter · #155EEF accent · blanc dominant",
  "Enterprise B2B · Inter · Navy Ingénierie · blanc dominant",
);

const swaps = [
  ["#155eef", "#1e4d7b"],
  ["#155EEF", "#1E4D7B"],
  ["#0b3b8f", "#163a5f"],
  ["#0B3B8F", "#163A5F"],
  ["#0f172a", "#0f1419"],
  ["#0F172A", "#0F1419"],
  ["#64748b", "#5c6670"],
  ["#64748B", "#5C6670"],
  ["#f8fafc", "#f4f6f8"],
  ["#F8FAFC", "#F4F6F8"],
  ["#e2e8f0", "#dde2e8"],
  ["#E2E8F0", "#DDE2E8"],
  ["#eff6ff", "#e8eef4"],
  ["#EFF6FF", "#E8EEF4"],
  ["#5b8ff5", "#4a7cab"],
  ["#dbeafe", "#d4e0ec"],
  ["#1e293b", "#243b53"],
];

for (const [from, to] of swaps) {
  css = css.split(from).join(to);
}

fs.writeFileSync(cssPath, css);
console.log("Navy Ingénierie palette applied");
