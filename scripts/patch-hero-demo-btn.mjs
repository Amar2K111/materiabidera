/**
 * Hero demo CTA: remove transition-all / duration-200 (no fade on hover).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
} from "../src/components/landing/plumtech/landing-markup.ts";

let body = PLUMTECH_BODY_HTML;
const before = body;
body = body.replace(/transition-all duration-200 /g, "");
body = body.replace(/transition-colors /g, "");

if (body === before) {
  console.log("No transition classes found on demo buttons");
} else {
  console.log("Removed transition classes from demo buttons");
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
