const fs = require("fs");

for (const file of ["index.html", "tenderbolt-fr.html"]) {
  const h = fs.readFileSync(file, "utf8");
  const calc = h.indexOf("Les chiffres parlent");
  const social = h.indexOf("Ne nous croyez pas");
  const faq = h.indexOf("Questions fréquentes");
  const cta = h.indexOf("Pendant que vos concurrents");
  const mainClose = h.indexOf("</main>");
  console.log("\n===", file, "===");
  console.log("calc", calc, "social", social, "faq", faq, "cta", cta, "mainClose", mainClose);
  if (calc > 0) {
    console.log("after calc snippet:", h.slice(calc, calc + 200).replace(/\s+/g, " "));
  }
}
