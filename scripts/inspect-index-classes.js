const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(
  path.join(__dirname, "..", "index.html"),
  "utf8",
);

for (const pat of [
  "text-stone-1100",
  "text-white",
  "shadow-card",
  "prose",
  "bg-ember",
  "text-primary",
  "border-stone",
]) {
  const re = new RegExp(`class="([^"]*${pat}[^"]*)"`, "g");
  let m,
    n = 0;
  while ((m = re.exec(html)) && n < 3) {
    console.log(pat, "→", m[1].slice(0, 160));
    n++;
  }
}
