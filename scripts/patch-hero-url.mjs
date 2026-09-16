import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html.replaceAll("app.materiabtp.fr", "materiabtp.info");
html = html.replace(
  "min-h-[60vh] grid items-center px-stack sm:pl-gutter",
  "min-h-[60vh] grid items-start px-stack sm:pl-gutter",
);

fs.writeFileSync("index.html", html);
console.log("URL + grid align patched");
