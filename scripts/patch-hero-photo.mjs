import fs from "fs";

const path = "src/components/landing/plumtech/landing-markup.ts";
let src = fs.readFileSync(path, "utf8");

const start = src.indexOf('<div class=\\"hero-banner-media hero-materia__mockup hero-materia__mockup--desktop\\">');
const endMarker = '</div></div></div></div></div></div></div><div class=\\"relative mx-auto mt-stack-sm';
const end = src.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  console.error("Hero mockup block not found");
  process.exit(1);
}

const photoBlock =
  '<figure class=\\"hero-materia__photo\\">' +
  '<img loading=\\"eager\\" decoding=\\"async\\" class=\\"hero-materia__photo-img\\" ' +
  'src=\\"/materiabtp-assets/images/hero/male-entrepreneur-office.jpg\\" ' +
  'alt=\\"Responsable appels d&#x27;offres BTP travaillant sur un dossier au bureau\\" ' +
  'title=\\"Photo : Drazen Zigic / Magnific\\" fetchPriority=\\"high\\"/>' +
  "</figure>";

src = src.slice(0, start) + photoBlock + src.slice(end);
fs.writeFileSync(path, src, "utf8");
console.log("Hero mockup replaced with photo.");
