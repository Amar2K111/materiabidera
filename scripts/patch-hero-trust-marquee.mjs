/**
 * Hero trust caption: horizontal marquee on mobile (like gradient-hero badges).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
} from "../src/components/landing/plumtech/landing-markup.ts";

const CHECK =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-check shrink-0 text-primary" aria-hidden="true"><path d="M5 12l5 5l10 -10"></path></svg>';

const CAPTION =
  "Con&#xE7;u pour les PME BTP qui r&#xE9;pondent aux march&#xE9;s publics et priv&#xE9;s.";

function trustLi(ariaHidden) {
  return `<li aria-hidden="${ariaHidden}" class="shrink-0 flex items-center gap-snug" style="margin-right:2rem">${CHECK}<span class="hero-trust-caption font-display text-lead text-stone-800 whitespace-nowrap">${CAPTION}</span></li>`;
}

const OLD =
  `<div class="hero-trust-line relative flex items-center justify-center gap-snug px-stack">${CHECK}<p class="hero-trust-caption font-display text-lead text-stone-800">${CAPTION}</p></div>`;

const NEW = `<div class="overflow-hidden sm:hidden hero-trust-marquee" style="mask-image:linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);-webkit-mask-image:linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)"><ul class="flex w-max list-none animate-marquee" style="--marquee-duration:22s">${trustLi("false")}${trustLi("true")}</ul></div><div class="hero-trust-line relative hidden sm:flex items-center justify-center gap-snug px-stack">${CHECK}<p class="hero-trust-caption font-display text-lead text-stone-800">${CAPTION}</p></div>`;

let body = PLUMTECH_BODY_HTML;
if (!body.includes(OLD)) {
  console.error("hero-trust-line block not found");
  process.exit(1);
}

body = body.replace(OLD, NEW);

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

console.log("Hero trust mobile marquee applied");
