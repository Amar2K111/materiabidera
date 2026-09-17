/**
 * Remove trust fade overlay that covers the hero CTA button.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
} from "../src/components/landing/plumtech/landing-markup.ts";

const GRADIENT =
  '<div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-white to-40% -top-block"></div>';

let body = PLUMTECH_BODY_HTML;
const before = body;
body = body.replace(GRADIENT, "");

if (body === before) {
  console.log("Trust gradient overlay not found");
} else {
  console.log("Removed hero trust gradient overlay");
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
