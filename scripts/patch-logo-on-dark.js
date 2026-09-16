const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const onDark = "./materiabtp-assets/images/logo-materiabtp-wordmark-on-dark.png";

// Header + footer + tout fond sombre
html = html.replace(
  /\.\/materiabtp-assets\/images\/logo-materiabtp-wordmark-light\.png/g,
  onDark,
);
html = html.replace(
  /\.\/materiabtp-assets\/images\/logo-materiabtp-wordmark\.png/g,
  onDark,
);

fs.writeFileSync(indexPath, html);
console.log("index.html logos → wordmark-on-dark");
