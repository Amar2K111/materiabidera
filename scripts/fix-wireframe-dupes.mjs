import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const desktopStart = html.indexOf('<div class="relative hidden aspect-1196/462 w-full lg:block">');
const desktopEnd = html.indexOf('<div class="flex flex-col items-center gap-tight lg:hidden">', desktopStart);

let block = html.slice(desktopStart, desktopEnd);

block = block.replace(
  /<img src="\.\/materiabtp-assets\/images\/tech\/wireframe-materia\.svg"[\s\S]*?\/>/g,
  "",
);

const wireframes = [
  '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-80 text-wireframe-line/75" style="left:8.95%;top:60.67%;width:13.2%"/>',
  '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-80 rotate-180 text-wireframe-line/75" style="left:77.76%;top:9.32%;width:13.2%"/>',
  '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-60 text-wireframe-line/75" style="left:3.5%;top:18%;width:22%"/>',
  '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-60 text-wireframe-line/75" style="left:72%;top:50%;width:22%"/>',
].join("");

block = block.replace(
  '<div aria-hidden="true" class="absolute overflow-hidden backdrop-blur-xl"',
  `${wireframes}<div aria-hidden="true" class="absolute overflow-hidden backdrop-blur-xl"`,
);

html = html.slice(0, desktopStart) + block + html.slice(desktopEnd);

const mobileStart = html.indexOf('<div class="flex flex-col items-center gap-tight lg:hidden">');
const mobileEnd = html.indexOf("</section>", mobileStart);
let mobile = html.slice(mobileStart, mobileEnd);

mobile = mobile.replace(
  /<img src="\.\/materiabtp-assets\/images\/tech\/wireframe-materia\.svg"[\s\S]*?\/>/g,
  "",
);

const mobileWireframe =
  '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-70 text-wireframe-line/75" style="left:50%;top:52%;width:55%;transform:translateX(-50%)"/>';

mobile = mobile.replace(
  '<div class="relative w-full p-7">',
  `<div class="relative w-full p-7">${mobileWireframe}`,
);

html = html.slice(0, mobileStart) + mobile + html.slice(mobileEnd);
fs.writeFileSync("index.html", html);
console.log("deduped wireframe logos");
