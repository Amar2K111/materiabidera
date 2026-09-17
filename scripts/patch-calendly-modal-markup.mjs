/**
 * Fix PLUMTECH_MODAL_HTML: remove literal \\r sequences that render as text in the DOM.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
} from "../src/components/landing/plumtech/landing-markup.ts";

const MODAL_HTML = `<!-- MATERIABTP:CALENDLY-MODAL:START -->
<link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css"/>
<link rel="stylesheet" href="/materiabtp-assets/materia-calendly-modal.css?v=5"/>
<div id="demo-modal" class="demo-modal" aria-hidden="true">
<div class="demo-modal__backdrop"></div>
<div class="demo-modal__panel" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
<aside class="demo-modal__intro">
<div>
<div class="demo-modal__brand"><img src="/materiabtp-assets/images/logo-materiabtp-wordmark.png" alt="MateriaBTP" width="163" height="28"/></div>
<h2 id="demo-modal-title">Votre prochain <em>appel d'offres</em> en 30 minutes</h2>
<p>D\u00e9couvrez comment MateriaBTP structure votre r\u00e9ponse, de l'analyse du DCE au m\u00e9moire technique v\u00e9rifi\u00e9.</p>
</div>
<ul class="demo-modal__points">
<li>Analyse en direct d'un de vos DCE en cours</li>
<li>Parcours MateriaBTP de bout en bout sur votre cas</li>
<li>R\u00e9ponses claires sur l'ad\u00e9quation, la s\u00e9curit\u00e9 et l'adoption</li>
</ul>
<p class="demo-modal__meta">30 min \u00b7 visioconf\u00e9rence \u00b7 sans engagement</p>
</aside>
<div class="demo-modal__main">
<div class="demo-modal__head">
<div class="demo-modal__steps" aria-hidden="true"><span class="is-on"><i></i> Choisir un cr\u00e9neau</span><span><i></i> Confirmer</span></div>
<button type="button" class="demo-modal__close" aria-label="Fermer">\u00d7</button>
</div>
<div class="demo-modal__embed" id="calendly-embed"></div>
</div>
</div>
</div>
<!-- MATERIABTP:CALENDLY-MODAL:END -->`;

const markupPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/landing/plumtech/landing-markup.ts",
);

const out = `/** Generated from index.html — ne pas editer a la main. Relancer: node scripts/extract-plumtech-landing.mjs */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(PLUMTECH_INLINE_STYLE)};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(PLUMTECH_BODY_HTML)};
export const PLUMTECH_MODAL_HTML = ${JSON.stringify(MODAL_HTML)};
`;

fs.writeFileSync(markupPath, out);
console.log("PLUMTECH_MODAL_HTML fixed");
