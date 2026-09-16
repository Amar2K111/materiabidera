import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html.replace(
  "Le logiciel IA de réponse aux appels d&#x27;offres et RFP ",
  "Le logiciel IA de réponse aux appels d&#x27;offres ",
);

html = html.replace(
  "Automatisez vos réponses aux RFP et appels d&#x27;offres publics.",
  "Automatisez vos réponses aux appels d&#x27;offres publics.",
);

fs.writeFileSync("index.html", html);
console.log("RFP retiré du hero h1 + lead");
