import fs from "fs";
import path from "path";

const html = fs.readFileSync("index.html", "utf8");

function extract(tag, endTag) {
  const start = html.indexOf(`<${tag}`);
  const end = html.indexOf(endTag, start);
  if (start === -1 || end === -1) throw new Error(`Missing ${tag}`);
  return html.slice(start, end + endTag.length);
}

const inlineStyles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) =>
  m[0].replace(/^<style[^>]*>/, "").replace(/<\/style>$/, ""),
);
const inlineStyle = inlineStyles.join("\n");

let body = extract("header", "</header>") + extract("main", "</main>") + extract("footer", "</footer>");

body = body
  .replace(/\.\/materiabtp-assets\//g, "/materiabtp-assets/")
  .replace(/href="\/fr"/g, 'href="/"');

const modalMatch = html.match(
  /<!-- MATERIABTP:CALENDLY-MODAL:START -->[\s\S]*<!-- MATERIABTP:CALENDLY-MODAL:END -->/,
);
const modal = modalMatch?.[0] ?? "";

const outDir = path.join("src", "components", "landing", "plumtech");
fs.mkdirSync(outDir, { recursive: true });

const ts = `/** Generated from index.html — ne pas editer a la main. Relancer: node scripts/extract-plumtech-landing.mjs */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(inlineStyle)};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(body)};
export const PLUMTECH_MODAL_HTML = ${JSON.stringify(modal)};
`;

fs.writeFileSync(path.join(outDir, "landing-markup.ts"), ts);
console.log("Wrote landing-markup.ts", { body: body.length, modal: modal.length, style: inlineStyle.length });
