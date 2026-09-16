#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const INDEX = path.join(path.resolve(import.meta.dirname, ".."), "index.html");
let html = fs.readFileSync(INDEX, "utf8");

html = html.replace(
  /<!-- MATERIABTP:HERO-BG:START -->[\s\S]*?<!-- MATERIABTP:HERO-BG:END -->/,
  "",
);

html = html.replace(
  "section class=\"hero-animated-bg relative isolate flex flex-col overflow-clip bg-white pt-header text-stone-1200 sm:justify-center\">",
  "section class=\"relative isolate flex flex-col overflow-clip bg-white pt-header text-stone-1200 sm:justify-center\">",
);

html = html.replace(
  /<link rel="stylesheet" href="\.\/materiabtp-assets\/materia-hero-animated-bg\.css(?:\?v=\d+)?"\/>/,
  "",
);

html = html.replace(
  /<script src="\.\/materiabtp-assets\/materia-hero-animated-bg\.js(?:\?v=\d+)?" defer><\/script>/,
  "",
);

fs.writeFileSync(INDEX, html);
console.log("Hero animated background removed from index.html");
