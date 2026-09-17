/**
 * Feature cards: replace shape.svg patterns with rounded deco squares.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
} from "../src/components/landing/plumtech/landing-markup.ts";

const PATTERN_RE =
  /<div aria-hidden="true" class="absolute inset-0" style="transform:translate\([^"]*\)"><div aria-hidden="true" class="pointer-events-none absolute bg-no-repeat[\s\S]*?<\/div><div aria-hidden="true" class="pointer-events-none absolute bg-no-repeat[\s\S]*?<\/div><\/div>/g;

const LAZULI_DECO =
  '<div aria-hidden="true" class="absolute isolate aspect-square overflow-hidden rounded-[2.4rem] bg-lazuli-200 top-[-4.5%] left-[-4.5%] w-[45%]"></div><div aria-hidden="true" class="absolute isolate aspect-square overflow-hidden rounded-[2.4rem] bg-ember-50 right-[-4.5%] bottom-[-4.5%] w-[45%]"></div>';

const EMBER_DECO =
  '<div aria-hidden="true" class="absolute isolate aspect-square overflow-hidden rounded-[2.4rem] bg-ember-50 top-[-4.5%] left-[-4.5%] w-[45%]"></div><div aria-hidden="true" class="absolute isolate aspect-square overflow-hidden rounded-[2.4rem] bg-lazuli-200 right-[-4.5%] bottom-[-4.5%] w-[45%]"></div>';

const VISUAL_RE =
  /<div class="relative isolate flex items-center justify-center overflow-hidden md:\[direction:ltr\] max-h-\[60vh\] md:max-h-full bg-(?:lazuli-200|ember-50)">/g;

const VISUAL_OPEN =
  '<div class="relative isolate flex items-center justify-center overflow-hidden md:[direction:ltr] max-h-[60vh] md:max-h-full bg-surface-plum spot-card-visual">';

let body = PLUMTECH_BODY_HTML;
const before = body;

body = body.replace(VISUAL_RE, VISUAL_OPEN);

let lazuliNext = true;
body = body.replace(PATTERN_RE, () => {
  const deco = lazuliNext ? LAZULI_DECO : EMBER_DECO;
  lazuliNext = !lazuliNext;
  return deco;
});

const shapesLeft = (body.match(/shape\.svg/g) || []).length;
if (shapesLeft > 0) {
  console.warn("warning:", shapesLeft, "shape.svg references remain");
}

if (body === before) {
  console.log("No spot-card patterns updated");
} else {
  const replaced = (before.match(PATTERN_RE) || []).length;
  console.log("Replaced", replaced, "pattern blocks with deco squares");
}

const out = `/** Generated — modal: DemoModal React component */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(PLUMTECH_INLINE_STYLE)};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(body)};
`;

fs.writeFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../src/components/landing/plumtech/landing-markup.ts",
  ),
  out,
);
