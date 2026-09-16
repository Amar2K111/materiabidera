const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");

let html = fs.readFileSync(indexPath, "utf8");

const linkTag =
  '<link rel="stylesheet" href="./materiabtp-assets/materia-brand-alignment.css"/>';

if (!html.includes("materia-brand-alignment.css")) {
  html = html.replace(
    /<\/style><link rel="preload" as="script"/,
    `</style>${linkTag}<link rel="preload" as="script"`,
  );
}

const lazuliFrom =
  /--color-lazuli-0:#fbf6e3;--color-lazuli-100:#f3e6a8;--color-lazuli-200:#e3a004;--color-lazuli-300:#af961c/g;
const lazuliTo =
  "--color-lazuli-0:#eef2fb;--color-lazuli-100:#d4e3f6;--color-lazuli-200:#3580d4;--color-lazuli-300:#0035a9";

html = html.replace(lazuliFrom, lazuliTo);

html = html
  .replace(/--color-lazuli-0:#fbf6e3/g, "--color-lazuli-0:#eef2fb")
  .replace(/--color-lazuli-100:#f3e6a8/g, "--color-lazuli-100:#d4e3f6")
  .replace(/--color-lazuli-200:#e3a004/g, "--color-lazuli-200:#3580d4")
  .replace(/--color-lazuli-300:#af961c/g, "--color-lazuli-300:#0035a9");

fs.writeFileSync(indexPath, html);
console.log("MateriaBTP brand alignment applied to index.html");
