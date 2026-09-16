import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const sectionStart = html.indexOf('<section class="gradient-hero');
const sectionEnd = html.indexOf("</section>", sectionStart);
if (sectionStart < 0 || sectionEnd < 0) {
  console.error("gradient-hero section not found");
  process.exit(1);
}

let section = html.slice(sectionStart, sectionEnd);
const before = section;

section = section.replace(
  /<img src="\.\/materiabtp-assets\/images\/tech\/wireframe-arrow\.avif"[^>]*\/>/g,
  "",
);

if (section === before) {
  console.error("No wireframe-arrow images found in gradient-hero");
  process.exit(1);
}

const removed = (before.match(/wireframe-arrow/g) || []).length;
html = html.slice(0, sectionStart) + section + html.slice(sectionEnd);
fs.writeFileSync("index.html", html);

console.log(`Removed ${removed} wireframe-arrow logo pattern(s) from gradient-hero`);
console.log("Remaining in section:", section.includes("wireframe-arrow") ? "yes" : "no");
