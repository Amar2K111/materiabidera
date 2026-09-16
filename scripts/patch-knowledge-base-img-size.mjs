import fs from "fs";

const NEW_IMG = `<img src="./materiabtp-assets/images/features/cards/knowledge-base-fr.png" srcSet="./materiabtp-assets/images/_r/features/cards/knowledge-base-fr-480.png 480w, ./materiabtp-assets/images/_r/features/cards/knowledge-base-fr-640.png 640w, ./materiabtp-assets/images/_r/features/cards/knowledge-base-fr-960.png 960w, ./materiabtp-assets/images/features/cards/knowledge-base-fr.png 1440w" sizes="min(480px, 80vw)" alt="Capture MateriaBTP : base entreprise (references, equipe, certifications, methodes)" fetchPriority="low" style="max-width:min(480px, 100%)" class="relative max-h-full p-tight lg:p-stack-sm"/>`;

let html = fs.readFileSync("index.html", "utf8");
const re =
  /<img src="\.\/materiabtp-assets\/images\/features\/cards\/knowledge-base-fr\.png"[^>]+\/>/;

if (!re.test(html)) {
  console.error("knowledge-base-fr img not found");
  process.exit(1);
}

html = html.replace(re, NEW_IMG);
fs.writeFileSync("index.html", html);
console.log("knowledge-base-fr img resized like other feature cards");
