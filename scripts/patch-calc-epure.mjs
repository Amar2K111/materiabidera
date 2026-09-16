import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

// Remove decorative shapes + soften outer shell
html = html.replace(
  /<div class="relative isolate overflow-hidden rounded-\[30px\] bg-dark-orange-100 p-3 md:p-4"><div aria-hidden="true" class="pointer-events-none absolute inset-0"><div aria-hidden="true" class="pointer-events-none absolute bg-no-repeat bg-size-\[100%_100%\] bg-dark-orange-200" style="height:95%;aspect-ratio:3\.0699786324786325;left:118%;top:22%;transform:translateX\(-50%\) translateY\(-50%\);mask-image:url\(\.\/materiabtp-assets\/images\/shape\.svg\);mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-image:url\(\.\/materiabtp-assets\/images\/shape\.svg\);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat"><\/div><div aria-hidden="true" class="pointer-events-none absolute bg-no-repeat bg-size-\[100%_100%\] bg-dark-orange-200" style="height:95%;aspect-ratio:3\.0699786324786325;left:-18%;top:88%;transform:translateX\(-50%\) translateY\(-50%\);mask-image:url\(\.\/materiabtp-assets\/images\/shape\.svg\);mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-image:url\(\.\/materiabtp-assets\/images\/shape\.svg\);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat"><\/div><\/div>/,
  '<div class="relative isolate overflow-hidden rounded-[30px] bg-stone-100 p-3 md:p-4">',
);

const calcStart = html.indexOf('<style id="materia-calc-styles">');
let calcEnd = html.indexOf(
  "</div><div class=\"relative hidden overflow-hidden rounded-xl",
  calcStart,
);
if (calcEnd === -1) {
  calcEnd = html.indexOf(
    "</div></div><div class=\"relative hidden overflow-hidden rounded-xl",
    calcStart,
  );
}
if (calcStart === -1 || calcEnd === -1) {
  throw new Error("Calculator block boundaries not found");
}

const styleBlock = `<style id="materia-calc-styles">#materia-roi-calc{--mc-accent:var(--color-dark-orange-100,#3580d4);--mc-track:#e7e5e4;font-family:inherit}#materia-roi-calc .mc-sliders{display:grid;grid-template-columns:1fr;gap:clamp(.5rem,2.4cqi,.75rem)}@media(min-width:640px){#materia-roi-calc .mc-sliders{grid-template-columns:1fr 1fr}}#materia-roi-calc .mc-field{display:flex;flex-direction:column;gap:.5rem;padding:clamp(.625rem,4cqi,1rem);border-radius:clamp(.625rem,3cqi,.9375rem);background:var(--color-stone-100,#f5f5f4)}#materia-roi-calc .mc-field-head{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem}#materia-roi-calc .mc-label{font-size:clamp(.8125rem,3.6cqi,.9375rem);font-weight:500;color:var(--color-stone-800,#292524);line-height:1.3}#materia-roi-calc .mc-value{font-family:var(--font-display,inherit);font-size:clamp(1.125rem,5cqi,1.375rem);font-weight:700;color:var(--color-stone-1200,#1c1917);line-height:1}#materia-roi-calc .mc-range{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:999px;background:linear-gradient(90deg,var(--mc-accent) 0%,var(--mc-accent) var(--mc-fill,35%),var(--mc-track) var(--mc-fill,35%),var(--mc-track) 100%);outline:none;cursor:pointer}#materia-roi-calc .mc-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--mc-accent);box-shadow:0 1px 3px rgba(0,0,0,.12);cursor:pointer}#materia-roi-calc .mc-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--mc-accent);cursor:pointer}#materia-roi-calc .mc-results{display:flex;gap:clamp(.5rem,2.4cqi,.75rem);align-items:stretch}#materia-roi-calc .mc-result{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(.25rem,1.2cqi,.375rem);padding:clamp(.625rem,4cqi,1.25rem);border-radius:clamp(.625rem,3cqi,.9375rem);background:var(--color-stone-100,#f5f5f4);text-align:center}#materia-roi-calc .mc-result-num{display:flex;align-items:flex-end;justify-content:center;gap:.125rem;font-family:var(--font-display,inherit);font-weight:700;color:var(--color-stone-1200,#1c1917);line-height:1}#materia-roi-calc .mc-result-num .mc-main{font-size:clamp(1.5rem,8cqi,2.5rem)}#materia-roi-calc .mc-result-num .mc-unit{font-size:clamp(1rem,5.6cqi,1.75rem);padding-bottom:.125rem}#materia-roi-calc .mc-result-label{font-size:clamp(.8125rem,3.6cqi,1.125rem);line-height:1.25;color:var(--color-stone-800,#292524)}#materia-roi-calc .mc-foot{font-size:clamp(.75rem,2.8cqi,.8125rem);line-height:1.45;color:var(--color-stone-700,#44403c);margin:0}</style>`;

const calculator = `${styleBlock}<div id="materia-roi-calc" class="flex flex-col gap-[clamp(0.5rem,2.4cqi,0.75rem)]"><div class="mc-sliders"><div class="mc-field"><div class="mc-field-head"><span class="mc-label">Dossiers AO par an</span><span class="mc-value" id="materia-calc-dossiers-val">12</span></div><input id="materia-calc-dossiers" class="mc-range" type="range" min="1" max="40" step="1" value="12" aria-label="Nombre de dossiers appels d'offres par an"/></div><div class="mc-field"><div class="mc-field-head"><span class="mc-label">Heures par dossier</span><span class="mc-value" id="materia-calc-hours-val">20 h</span></div><input id="materia-calc-hours" class="mc-range" type="range" min="8" max="50" step="2" value="20" aria-label="Heures passées par dossier, du DCE au mémoire"/></div></div><div class="mc-results"><div class="mc-result"><div class="mc-result-num"><span class="mc-main" id="materia-calc-saved-hours">84</span><span class="mc-unit">h</span></div><p class="mc-result-label">économisées par an</p></div><span aria-hidden="true" class="w-px shrink-0 self-stretch bg-stone-400"></span><div class="mc-result"><div class="mc-result-num"><span class="mc-main" id="materia-calc-saved-days">11</span></div><p class="mc-result-label">jours ouvrés récupérés</p></div></div><p class="mc-foot">Estimation indicative (~35&nbsp;% de gain sur les phases assistées). Vous gardez la main sur chaque contenu généré.</p></div><script>(function(){var R=0.35;function fmt(n){return new Intl.NumberFormat("fr-FR").format(n)}function fill(el){var min=+el.min,max=+el.max,val=+el.value;el.style.setProperty("--mc-fill",((val-min)/(max-min)*100)+"%")}function update(){var dEl=document.getElementById("materia-calc-dossiers");var hEl=document.getElementById("materia-calc-hours");if(!dEl||!hEl)return;var dossiers=+dEl.value,hours=+hEl.value;document.getElementById("materia-calc-dossiers-val").textContent=fmt(dossiers);document.getElementById("materia-calc-hours-val").textContent=fmt(hours)+" h";fill(dEl);fill(hEl);var saved=Math.round(dossiers*hours*R);document.getElementById("materia-calc-saved-hours").textContent=fmt(saved);document.getElementById("materia-calc-saved-days").textContent=fmt(Math.round(saved/8))}["materia-calc-dossiers","materia-calc-hours"].forEach(function(id){var el=document.getElementById(id);if(el){el.addEventListener("input",update);el.addEventListener("change",update)}});update()})();<\/script>`;

html = html.slice(0, calcStart) + calculator + html.slice(calcEnd);

// Tighter header copy spacing
html = html.replace(
  "Simulez le temps récupérable sur vos dossiers BTP, du DCE au mémoire technique.",
  "Ajustez votre volume et estimez le temps récupérable, du DCE au mémoire technique.",
);

// Fix stray artifact at EOF if present
html = html.replace(/<\/html>@index\.html\s*$/, "</html>");

fs.writeFileSync(htmlPath, html);

console.log("Calculator section épured");
console.log("  has script:", html.includes("materia-calc-dossiers") && html.includes("R=0.35"));
console.log("  stone results:", html.includes("mc-result-num") && !html.includes("mc-result::before"));
console.log("  outer stone-100:", html.includes("rounded-[30px] bg-stone-100 p-3"));
