#!/usr/bin/env node
/**
 * Injecte la modale demo Calendly dans index.html (landing statique).
 * Ajoute btn-calendly aux boutons « Réserver une démo » (hors submit formulaire).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const INDEX = path.join(ROOT, "index.html");

const MODAL_HTML = `<!-- MATERIABTP:CALENDLY-MODAL:START -->
<link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css"/>
<link rel="stylesheet" href="./materiabtp-assets/materia-calendly-modal.css?v=2"/>
<div id="demo-modal" class="demo-modal" aria-hidden="true">
<div class="demo-modal__backdrop"></div>
<div class="demo-modal__panel" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
<aside class="demo-modal__intro">
<div>
<div class="demo-modal__brand"><img src="./materiabtp-assets/images/logo-materiabtp-wordmark-on-dark.png" alt="MateriaBTP" width="163" height="28"/></div>
<h2 id="demo-modal-title">Votre prochain <em>appel d'offres</em> en 30 minutes</h2>
<p>Découvrez comment MateriaBTP structure votre réponse, de l'analyse du DCE au mémoire technique vérifié.</p>
</div>
<ul class="demo-modal__points">
<li>Analyse en direct d'un de vos DCE en cours</li>
<li>Parcours MateriaBTP de bout en bout sur votre cas</li>
<li>Réponses claires sur l'adéquation, la sécurité et l'adoption</li>
</ul>
<p class="demo-modal__meta">30 min · visioconférence · sans engagement</p>
</aside>
<div class="demo-modal__main">
<div class="demo-modal__head">
<div class="demo-modal__steps" aria-hidden="true"><span class="is-on"><i></i> Choisir un créneau</span><span><i></i> Confirmer</span></div>
<button type="button" class="demo-modal__close" aria-label="Fermer">×</button>
</div>
<div class="demo-modal__embed" id="calendly-embed"></div>
</div>
</div>
</div>
<script src="./materiabtp-assets/materia-calendly-modal.js"></script>
<!-- MATERIABTP:CALENDLY-MODAL:END -->`;

let html = fs.readFileSync(INDEX, "utf8");

if (html.includes("MATERIABTP:CALENDLY-MODAL:START")) {
  html = html.replace(
    /<!-- MATERIABTP:CALENDLY-MODAL:START -->[\s\S]*?<!-- MATERIABTP:CALENDLY-MODAL:END -->/,
    MODAL_HTML,
  );
} else {
  html = html.replace("</body>", `${MODAL_HTML}</body>`);
}

html = html.replace(
  /<button([^>]*type="button"[^>]*)>(\s*)Réserver une démo(\s*)<\/button>/g,
  (match, attrs) => {
    if (/\bbtn-calendly\b/.test(attrs)) return match;
    if (/\bclass="/i.test(attrs)) {
      return `<button${attrs.replace(/\bclass="/i, 'class="btn-calendly ')}>Réserver une démo</button>`;
    }
    return `<button class="btn-calendly"${attrs}>Réserver une démo</button>`;
  },
);

fs.writeFileSync(INDEX, html, "utf8");
console.log("patch-calendly-modal: index.html mis à jour");
