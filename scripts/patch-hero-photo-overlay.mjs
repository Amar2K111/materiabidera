import fs from "fs";

const path = "src/components/landing/plumtech/landing-markup.ts";
let src = fs.readFileSync(path, "utf8");

const figureStart = src.indexOf('<figure class=\\"hero-materia__photo\\">');
const figureEnd = src.indexOf("</figure>", figureStart) + 9;
if (figureStart === -1) {
  console.error("hero-materia__photo not found");
  process.exit(1);
}

const mockupDesktop =
  '<div class=\\"hero-banner-media hero-materia__mockup hero-materia__mockup--desktop\\">' +
  '<div class=\\"hero-banner-media__stage\\"><div class=\\"hero-banner-media__frame\\">' +
  '<div class=\\"hero-banner-media__chrome\\" aria-hidden=\\"true\\">' +
  '<div class=\\"hero-banner-media__dots\\"><span></span><span></span><span></span></div>' +
  '<div class=\\"hero-banner-media__url\\">materiabtp.info</div></div>' +
  '<div class=\\"hero-banner-media__viewport\\">' +
  '<img loading=\\"eager\\" decoding=\\"async\\" class=\\"hero-banner-media__img\\" ' +
  'src=\\"/materiabtp-assets/images/hero/dashboard-fr.png?v=25\\" ' +
  'srcSet=\\"/materiabtp-assets/images/_r/hero/dashboard-fr-480.png?v=25 480w, /materiabtp-assets/images/_r/hero/dashboard-fr-640.png?v=25 640w, /materiabtp-assets/images/_r/hero/dashboard-fr-960.png?v=25 960w, /materiabtp-assets/images/_r/hero/dashboard-fr-1440.png?v=25 1440w, /materiabtp-assets/images/hero/dashboard-fr.png?v=25 1440w\\" ' +
  'sizes=\\"(min-width: 640px) min(48vw, 560px), 1px\\" ' +
  'alt=\\"Capture MateriaBTP : tableau de bord avec dossiers appels d&#x27;offres BTP en cours\\" fetchPriority=\\"high\\"/>' +
  "</div></div></div></div>";

const mockupMobile =
  '<div class=\\"hero-banner-media hero-banner-media--mobile hero-materia__mockup hero-materia__mockup--mobile\\">' +
  '<div class=\\"hero-banner-media__stage\\"><div class=\\"hero-banner-media__frame\\">' +
  '<div class=\\"hero-banner-media__chrome\\" aria-hidden=\\"true\\">' +
  '<div class=\\"hero-banner-media__dots\\"><span></span><span></span><span></span></div>' +
  '<div class=\\"hero-banner-media__url\\">materiabtp.info</div></div>' +
  '<div class=\\"hero-banner-media__viewport\\">' +
  '<img loading=\\"lazy\\" decoding=\\"async\\" class=\\"hero-banner-media__img\\" ' +
  'src=\\"/materiabtp-assets/images/hero/dashboard-fr.png?v=25\\" ' +
  'srcSet=\\"/materiabtp-assets/images/_r/hero/dashboard-fr-480.png?v=25 480w, /materiabtp-assets/images/_r/hero/dashboard-fr-640.png?v=25 640w, /materiabtp-assets/images/_r/hero/dashboard-fr-960.png?v=25 960w, /materiabtp-assets/images/_r/hero/dashboard-fr-1440.png?v=25 1440w, /materiabtp-assets/images/hero/dashboard-fr.png?v=25 1440w\\" ' +
  'sizes=\\"100vw\\" ' +
  'alt=\\"Capture MateriaBTP : tableau de bord avec dossiers appels d&#x27;offres BTP en cours\\"/>' +
  "</div></div></div></div>";

const photoOverlay =
  '<figure class=\\"hero-materia__photo hero-materia__photo--bl\\">' +
  '<img loading=\\"eager\\" decoding=\\"async\\" class=\\"hero-materia__photo-img\\" ' +
  'src=\\"/materiabtp-assets/images/hero/male-entrepreneur-office.jpg\\" ' +
  'alt=\\"Responsable appels d&#x27;offres BTP travaillant sur un dossier au bureau\\" ' +
  'title=\\"Photo : Drazen Zigic / Magnific\\" fetchPriority=\\"high\\"/>' +
  "</figure>";

const newBlock = mockupDesktop + mockupMobile + photoOverlay;
src = src.slice(0, figureStart) + newBlock + src.slice(figureEnd);
fs.writeFileSync(path, src, "utf8");
console.log("Hero: mockup restored + photo overlay bottom-left.");
