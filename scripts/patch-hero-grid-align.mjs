import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html.replace(
  "min-h-[60vh] grid items-center px-stack sm:pl-gutter",
  "min-h-[60vh] grid items-start px-stack sm:pl-gutter",
);

fs.writeFileSync("index.html", html);
console.log("hero grid align-start applied");
