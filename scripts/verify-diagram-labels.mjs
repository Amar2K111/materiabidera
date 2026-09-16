import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf("relative hidden aspect-1196/462");
const end = html.indexOf("flex flex-col items-center gap-tight lg:hidden", start);
const block = html.slice(start, end);

const labels = [...block.matchAll(/absolute flex items-center" style="([^"]+)"/g)];
console.log("desktop labels:", labels.map((m) => m[1]));
console.log("Tenderbolt in block:", block.includes("Tenderbolt"));
console.log("Materia in block:", block.includes("Application MateriaBTP"));
