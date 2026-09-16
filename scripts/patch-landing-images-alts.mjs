import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html
  .split(
    "Équipe BTP analysant un DCE volumineux avant la remise du mémoire technique",
  )
  .join(
    "Capture MateriaBTP : analyse structurée d'un DCE (RC, CCTP, critères de jugement)",
  );
html = html
  .split("Équipe bid passant en revue les résultats d'un appel d'offres")
  .join(
    "Capture MateriaBTP : tableau de bord de suivi des dossiers appels d'offres",
  );

fs.writeFileSync("index.html", html);
console.log("RSC alt strings updated");
