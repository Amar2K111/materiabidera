const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const cssLink =
  '<link rel="stylesheet" href="./materiabtp-assets/materia-design-system.css"/>';

if (!html.includes("materia-design-system.css")) {
  html = html.replace("</head>", `${cssLink}</head>`);
}

// Dark wordmark in white header; keep light wordmark in footer/dark sections
html = html.replace(
  /<header[\s\S]*?logo-materiabtp-wordmark-light\.png/g,
  (match) =>
    match.replace(
      "logo-materiabtp-wordmark-light.png",
      "logo-materiabtp-wordmark.png",
    ),
);

// Remove redundant inline palette block (replaced by external CSS)
html = html.replace(
  /<style id="materia-palette-fix">[\s\S]*?<\/style>/,
  "",
);

fs.writeFileSync(indexPath, html);
console.log("index.html patched for MateriaBTP design system");
