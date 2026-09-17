/**
 * Hero H1: remove "et RFP", lighten "conçu pour gagner" (TenderCrunch style).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markupPath = path.join(
  __dirname,
  "../src/components/landing/plumtech/landing-markup.ts",
);

const src = fs.readFileSync(markupPath, "utf8");
const bodyMatch = src.match(
  /export const PLUMTECH_BODY_HTML = "([\s\S]*?)";\nexport const PLUMTECH_MODAL_HTML/,
);
if (!bodyMatch) throw new Error("PLUMTECH_BODY_HTML not found");

let body = bodyMatch[1]
  .replace(/\\"/g, '"')
  .replace(/\\n/g, "\n")
  .replace(/\\\\/g, "\\");

const oldPatterns = [
  /aux appels d&#x27;offres et RFP <span class="text-stone-900">con\u00e7u pour gagner<\/span>/,
  /aux appels d'offres et RFP <span class="text-stone-900">conçu pour gagner<\/span>/,
];

const replacement =
  "aux appels d&#x27;offres <span class=\"text-stone-700\">con\u00e7u pour gagner</span>";

let changed = false;
for (const re of oldPatterns) {
  if (re.test(body)) {
    body = body.replace(re, replacement);
    changed = true;
    break;
  }
}

if (!changed) {
  console.warn("Pattern not found — checking current H1...");
  const h1 = body.match(
    /<h1[^>]*>[\s\S]*?<\/h1>/,
  )?.[0];
  console.log(h1?.slice(0, 200));
  process.exit(1);
}

const inlineMatch = src.match(
  /export const PLUMTECH_INLINE_STYLE = "([\s\S]*?)";\nexport const PLUMTECH_BODY_HTML/,
);
const modalMatch = src.match(
  /export const PLUMTECH_MODAL_HTML = "([\s\S]*?)";\n?$/,
);

const out = `/** Generated from index.html — ne pas editer a la main. Relancer: node scripts/extract-plumtech-landing.mjs */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(
  inlineMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\"),
)};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(body)};
export const PLUMTECH_MODAL_HTML = ${JSON.stringify(
  modalMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\"),
)};
`;

fs.writeFileSync(markupPath, out);
console.log("Hero H1 patched: removed RFP, span -> text-stone-700");
