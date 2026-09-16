const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const body = html.slice(html.indexOf("<body"));

// svgs that are NOT shape path (shorter paths = pipes?)
const matches = [...body.matchAll(/<svg aria-hidden="true"[^>]*>[\s\S]*?<\/svg>/g)];
for (const m of matches) {
  const s = m[0];
  if (!s.includes("M4396.1") && s.length < 2000) {
    console.log("--- non-shape svg ---");
    console.log(s);
  }
}

// count wireframe-arrow imgs
const wf = body.match(/wireframe-arrow\.avif/g);
console.log("\nwireframe-arrow count:", wf?.length);
