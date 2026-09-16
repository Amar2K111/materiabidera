import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
for (const name of ["analysis-fr", "questionnaire-fr", "proposal-fr", "knowledge-base-fr"]) {
  const i = html.indexOf(name + ".png");
  if (i < 0) continue;
  const start = html.lastIndexOf("<img", i);
  const end = html.indexOf("/>", i) + 2;
  console.log("\n===", name, "===\n");
  console.log(html.slice(start, end));
}
