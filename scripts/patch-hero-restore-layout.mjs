/**
 * Restore hero 2-column layout: close copy column before visual mockup.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const markupPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/landing/plumtech/landing-markup.ts",
);

const src = fs.readFileSync(markupPath, "utf8");
const unescape = (s) =>
  s.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");

const inlineMatch = src.match(
  /export const PLUMTECH_INLINE_STYLE = "([\s\S]*?)";\nexport const PLUMTECH_BODY_HTML/,
);
const bodyMatch = src.match(
  /export const PLUMTECH_BODY_HTML = "([\s\S]*?)";\nexport const PLUMTECH_MODAL_HTML/,
);
const modalMatch = src.match(
  /export const PLUMTECH_MODAL_HTML = "([\s\S]*?)";\n?$/,
);

if (!inlineMatch || !bodyMatch || !modalMatch) {
  throw new Error("Could not parse landing-markup.ts");
}

let body = unescape(bodyMatch[1]);

const broken = "</button><div class=\"hero-materia__visual";
const fixed = "</button></div><div class=\"hero-materia__visual";

if (body.includes(fixed)) {
  console.log("Hero layout already correct");
  process.exit(0);
}

if (!body.includes(broken)) {
  throw new Error("Broken hero layout pattern not found");
}

body = body.replace(broken, fixed);

const out = `/** Generated from index.html — ne pas editer a la main. Relancer: node scripts/extract-plumtech-landing.mjs */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(unescape(inlineMatch[1]))};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(body)};
export const PLUMTECH_MODAL_HTML = ${JSON.stringify(unescape(modalMatch[1]))};
`;

fs.writeFileSync(markupPath, out);
console.log("Hero layout restored: mockup back in right column");
