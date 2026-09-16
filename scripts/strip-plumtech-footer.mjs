import fs from "fs";

const file = "src/components/landing/plumtech/landing-markup.ts";
const src = fs.readFileSync(file, "utf8");
const prefix = 'export const PLUMTECH_BODY_HTML = "';
const start = src.indexOf(prefix);
if (start === -1) throw new Error("PLUMTECH_BODY_HTML not found");

let i = start + prefix.length;
let body = "";
while (i < src.length) {
  const ch = src[i];
  if (ch === "\\") {
    body += src[i + 1] === "n" ? "\n" : src[i + 1] === '"' ? '"' : src[i + 1];
    i += 2;
    continue;
  }
  if (ch === '"') break;
  body += ch;
  i++;
}

const stripped = body.replace(/<footer[\s\S]*?<\/footer>/, "");
const escaped = stripped
  .replace(/\\/g, "\\\\")
  .replace(/"/g, '\\"')
  .replace(/\n/g, "\\n");

const next =
  src.slice(0, start) +
  prefix +
  escaped +
  '";' +
  src.slice(i + 1);

fs.writeFileSync(file, next);
console.log("footer stripped, body length:", stripped.length);
