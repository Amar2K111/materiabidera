import fs from "fs";
const h = fs.readFileSync("index.html", "utf8");
console.log("frame", h.includes("hero-banner-media__frame"));
console.log("viewport", h.includes("hero-banner-media__viewport"));
console.log("bezel", h.includes("hero-banner-media__bezel"));
