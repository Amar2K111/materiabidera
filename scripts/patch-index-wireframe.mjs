import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

html = html.replace(
  /\.\/materiabtp-assets\/images\/tech\/wireframe-arrow\.avif/g,
  "./materiabtp-assets/images/tech/wireframe-materia.svg",
);

function stripWireframeSvgs(block) {
  return block.replace(
    /<svg aria-hidden="true" class="pointer-events-none overflow-visible[^"]*"[^>]*>[\s\S]*?<\/svg>/g,
    "",
  );
}

function addMateriaWireframes(block) {
  const wireframes = [
    '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-80 text-wireframe-line/75" style="left:8.95%;top:60.67%;width:13.2%"/>',
    '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-80 rotate-180 text-wireframe-line/75" style="left:77.76%;top:9.32%;width:13.2%"/>',
    '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-60 text-wireframe-line/75" style="left:3.5%;top:18%;width:22%"/>',
    '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-60 text-wireframe-line/75" style="left:72%;top:50%;width:22%"/>',
  ].join("");

  return block.replace(
    '<div aria-hidden="true" class="absolute overflow-hidden backdrop-blur-xl"',
    `${wireframes}<div aria-hidden="true" class="absolute overflow-hidden backdrop-blur-xl"`,
  );
}

const desktopStart = html.indexOf('<div class="relative hidden aspect-1196/462 w-full lg:block">');
const desktopEnd = html.indexOf('<div class="flex flex-col items-center gap-tight lg:hidden">', desktopStart);

if (desktopStart < 0 || desktopEnd < 0) {
  console.error("desktop block not found", desktopStart, desktopEnd);
  process.exit(1);
}

let desktopBlock = html.slice(desktopStart, desktopEnd);
desktopBlock = stripWireframeSvgs(desktopBlock);
desktopBlock = addMateriaWireframes(desktopBlock);
html = html.slice(0, desktopStart) + desktopBlock + html.slice(desktopEnd);

const mobileStart = html.indexOf('<div class="flex flex-col items-center gap-tight lg:hidden">');
const mobileEnd = html.indexOf("</section>", mobileStart);

if (mobileStart < 0 || mobileEnd < 0) {
  console.error("mobile block not found", mobileStart, mobileEnd);
  process.exit(1);
}

let mobileBlock = html.slice(mobileStart, mobileEnd);
mobileBlock = stripWireframeSvgs(mobileBlock);

const mobileWireframe =
  '<img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-70 text-wireframe-line/75" style="left:50%;top:52%;width:55%;transform:translateX(-50%)"/>';

mobileBlock = mobileBlock.replace(
  '<div class="relative w-full p-7">',
  `<div class="relative w-full p-7">${mobileWireframe}`,
);

html = html.slice(0, mobileStart) + mobileBlock + html.slice(mobileEnd);

fs.writeFileSync("index.html", html);
console.log("index.html patched");
