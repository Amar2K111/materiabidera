const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const oldResult =
  '#materia-roi-calc .mc-result{position:relative;overflow:hidden;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:clamp(.25rem,1.2cqi,.375rem);padding:clamp(.625rem,4cqi,1.25rem);border-radius:clamp(.625rem,3cqi,.9375rem);background:#155EEF;color:#fff;text-align:center}#materia-roi-calc .mc-result::before{content:"";position:absolute;pointer-events:none;height:110%;aspect-ratio:3.07;right:-30%;top:-20%;background:var(--mc-accent-deep);opacity:.85;mask-image:url(./materiabtp-assets/images/shape.svg);mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-image:url(./materiabtp-assets/images/shape.svg);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat}';

const newResult =
  '#materia-roi-calc .mc-result{position:relative;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:clamp(.25rem,1.2cqi,.375rem);padding:clamp(.625rem,4cqi,1.25rem);border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;text-align:center}#materia-roi-calc .mc-result::before{display:none!important}#materia-roi-calc .mc-result-num span:first-child{color:#155eef}#materia-roi-calc .mc-result-label{color:#64748b;opacity:1}';

if (!html.includes(oldResult)) {
  console.error("mc-result block not found — may already be patched");
  process.exit(1);
}

html = html.replace(oldResult, newResult);
fs.writeFileSync(indexPath, html);
console.log("ROI calculator mc-result patterns removed");
