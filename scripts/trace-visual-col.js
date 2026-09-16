const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");

const visualOpen = h.indexOf(
  '</button></div><div><img src="./materiabtp-assets/images/hero/dashboard-fr.avif"',
);
const trustOpen = h.indexOf('<div class="relative mx-auto mt-stack-sm', visualOpen);

console.log("visual column HTML:");
console.log(h.slice(visualOpen, trustOpen + 120));

// Count divs between visual open and trust open
const between = h.slice(visualOpen, trustOpen);
const opens = (between.match(/<div/g) || []).length;
const closes = (between.match(/<\/div>/g) || []).length;
console.log("\nopens:", opens, "closes:", closes, "net:", opens - closes);
