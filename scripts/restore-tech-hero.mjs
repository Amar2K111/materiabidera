import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const desktopStart = html.indexOf('<div class="relative hidden aspect-1196/462 w-full lg:block">');
const desktopEnd = html.indexOf('<div class="flex flex-col items-center gap-tight lg:hidden">', desktopStart);

if (desktopStart < 0 || desktopEnd < 0) {
  console.error("desktop block not found");
  process.exit(1);
}

const restoredDesktop = `<div class="relative hidden aspect-1196/462 w-full lg:block"><svg aria-hidden="true" class="pointer-events-none overflow-visible absolute inset-0 size-full text-wireframe/70" fill="none"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="100%" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:1.34%;top:3.47%;width:28.5%;height:92.97%" fill="none"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="100%" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:70.15%;top:3.47%;width:28.5%;height:92.97%" fill="none"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="100%" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><div class="absolute" style="left:1.34%;top:14.52%;width:28.5%;height:26.44%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"></div><div class="absolute" style="left:1.34%;top:40.95%;width:28.5%;height:11.48%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"></div><div class="absolute" style="left:70.15%;top:46.16%;width:28.5%;height:23.4%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"></div><div class="absolute" style="left:70.15%;top:69.56%;width:28.5%;height:13.22%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"></div><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:1.34%;top:14.52%;width:28.5%;height:26.44%" fill="none"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:1.34%;top:40.95%;width:28.5%;height:11.48%" fill="none"><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:70.15%;top:46.16%;width:28.5%;height:23.4%" fill="none"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:70.15%;top:69.56%;width:28.5%;height:13.22%" fill="none"><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-80" style="left:8.95%;top:60.67%;width:13.2%"/><img src="./materiabtp-assets/images/tech/wireframe-materia.svg" alt="" aria-hidden="true" class="pointer-events-none absolute opacity-80 rotate-180" style="left:77.76%;top:9.32%;width:13.2%"/><div aria-hidden="true" class="absolute overflow-hidden backdrop-blur-xl" style="left:31.2%;top:0;width:37.6%;height:100%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"></div><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:26.38%;top:22.08%;width:17.52%;height:2px" fill="none"><line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:27.13%;top:46.91%;width:13.34%;height:2px" fill="none"><line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:62.17%;top:52.28%;width:9.08%;height:2px" fill="none"><line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute" style="left:54.64%;top:76.06%;width:17.6%;height:2px" fill="none"><line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg>`;

// Preserve stack + labels from current block
const current = html.slice(desktopStart, desktopEnd);
const stackMatch = current.match(/<div class="absolute flex items-center justify-center"[\s\S]*?<\/div>/);
const labels = [...current.matchAll(/<div class="absolute flex items-center" style="left:[^"]+"[\s\S]*?<\/div><\/div>/g)].map((m) => m[0]);

if (!stackMatch || labels.length !== 4) {
  console.error("could not preserve stack/labels", !!stackMatch, labels.length);
  process.exit(1);
}

const newDesktop = `${restoredDesktop}${stackMatch[0]}${labels.join("")}</div>`;
html = html.slice(0, desktopStart) + newDesktop + html.slice(desktopEnd);

// Fix mobile: remove floating wireframe logo, restore border svg
const mobileStart = html.indexOf('<div class="flex flex-col items-center gap-tight lg:hidden">');
const mobileEnd = html.indexOf("</section>", mobileStart);
let mobile = html.slice(mobileStart, mobileEnd);

mobile = mobile.replace(
  /<img src="\.\/materiabtp-assets\/images\/tech\/wireframe-materia\.svg"[\s\S]*?\/>/g,
  "",
);

if (!mobile.includes("pointer-events-none overflow-visible text-wireframe-line/75 absolute inset-0")) {
  mobile = mobile.replace(
    '<div class="relative w-full p-7">',
    '<div class="relative w-full p-7"><svg aria-hidden="true" class="pointer-events-none overflow-visible text-wireframe-line/75 absolute inset-0 size-full" fill="none"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="100%" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line><line x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8"></line></svg>',
  );
}

html = html.slice(0, mobileStart) + mobile + html.slice(mobileEnd);
fs.writeFileSync("index.html", html);
console.log("tech hero restored");
