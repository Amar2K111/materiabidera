import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const refs = [...html.matchAll(/logo-materiabtp[^"'\s]*/g)].map((m) => m[0]);
console.log([...new Set(refs)]);
