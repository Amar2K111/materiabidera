const fs = require("fs");
for (const f of ["index.html", "tenderbolt-fr.html"]) {
  const h = fs.readFileSync(f, "utf8");
  const i = h.indexOf("relative mx-auto mt-stack-sm");
  console.log("\n===", f, "===");
  console.log(h.slice(i, i + 2500).replace(/\s+/g, " ").slice(0, 1200));
}
