const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
console.log("design-system:", h.includes("materia-design-system.css"));
console.log("palette-fix removed:", !h.includes("materia-palette-fix"));
const header = h.match(/<header[\s\S]{0,1200}/);
console.log("header logo:", header ? header[0].includes("wordmark.png") : "no header");
