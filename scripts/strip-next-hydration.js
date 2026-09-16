const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const before = html.length;
let removedScripts = 0;

html = html.replace(
  /<link rel="preload" as="script"[^>]*href="https:\/\/www\.materiabtp\.ai[^"]*"[^>]*>/g,
  () => {
    removedScripts++;
    return "";
  },
);

html = html.replace(
  /<script[^>]*src="https:\/\/www\.materiabtp\.ai[^"]*"[^>]*><\/script>/g,
  () => {
    removedScripts++;
    return "";
  },
);

html = html.replace(
  /<script[^>]*src="https:\/\/www\.materiabtp\.ai[^"]*"[^>]*\/>/g,
  () => {
    removedScripts++;
    return "";
  },
);

// RSC flight payloads (hydration) — only inline scripts, never cross tag boundaries
html = html.replace(
  /<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/g,
  () => {
    removedScripts++;
    return "";
  },
);

// Next bootstrap inline
html = html.replace(/<script id="__NEXT_DATA__"[\s\S]*?<\/script>/g, () => {
  removedScripts++;
  return "";
});

fs.writeFileSync(indexPath, html);
console.log("removed script tags:", removedScripts);
console.log("bytes saved:", before - html.length);
