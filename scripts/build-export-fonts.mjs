// Genere src/lib/export/fonts.ts : la police Inter (licence SIL OFL 1.1)
// embarquee en base64 pour le rendu PDF des memoires techniques.
// Usage : node scripts/build-export-fonts.mjs  (apres npm install)
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "node_modules", "@fontsource", "inter", "files");
const faces = [
  { name: "INTER_400", file: "inter-latin-400-normal.woff" },
  { name: "INTER_400_ITALIC", file: "inter-latin-400-italic.woff" },
  { name: "INTER_600", file: "inter-latin-600-normal.woff" },
  { name: "INTER_700", file: "inter-latin-700-normal.woff" },
];

let out = `/**
 * Police Inter (sous-ensemble latin), embarquee pour le rendu PDF.
 * Licence : SIL Open Font License 1.1 (voir fonts-LICENSE.txt).
 * Fichier genere par scripts/build-export-fonts.mjs : ne pas modifier.
 */

`;
for (const face of faces) {
  const data = fs.readFileSync(path.join(source, face.file)).toString("base64");
  out += `export const ${face.name} = "data:font/woff;base64,${data}";\n\n`;
}
fs.writeFileSync(path.join(root, "src", "lib", "export", "fonts.ts"), out);
fs.copyFileSync(path.join(root, "node_modules", "@fontsource", "inter", "LICENSE"), path.join(root, "src", "lib", "export", "fonts-LICENSE.txt"));
console.log("fonts.ts genere :", Math.round(out.length / 1024), "Ko");
