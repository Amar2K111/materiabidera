import fs from "fs";
import path from "path";
import {
  PLUMTECH_BODY_HTML,
  PLUMTECH_INLINE_STYLE,
  PLUMTECH_MODAL_HTML,
} from "../src/components/landing/plumtech/landing-markup.ts";

let body = PLUMTECH_BODY_HTML;

body = body.replaceAll(
  "aux appels d'offres et RFP gr\u00e2ce",
  "aux appels d'offres BTP gr\u00e2ce",
);
body = body.replaceAll(
  "aux appels d&#x27;offres et RFP gr\u00e2ce",
  "aux appels d&#x27;offres BTP gr\u00e2ce",
);

body = body.replaceAll(
  "Parce que chaque appel d'offres ou RFP est diff\u00e9rent selon les secteurs, nous ne proposons pas de grille tarifaire g\u00e9n\u00e9rique.",
  "Parce que chaque march\u00e9 BTP est diff\u00e9rent (lots, corps d'\u00e9tat, crit\u00e8res), nous ne proposons pas de grille tarifaire g\u00e9n\u00e9rique.",
);
body = body.replaceAll(
  "Parce que chaque appel d&#x27;offres ou RFP est diff\u00e9rent selon les secteurs, nous ne proposons pas de grille tarifaire g\u00e9n\u00e9rique.",
  "Parce que chaque march\u00e9 BTP est diff\u00e9rent (lots, corps d&#x27;\u00e9tat, crit\u00e8res), nous ne proposons pas de grille tarifaire g\u00e9n\u00e9rique.",
);

const audienceOldPlain =
  "MateriaBTP est une plateforme d'IA modulaire qui s'adapte \u00e0 toutes les tailles d'entreprises, de la PME aux grands comptes. Si vous avez un minimum de volume et que vous ressentez le besoin d'\u00e9quiper vos \u00e9quipes d'un outil d\u00e9di\u00e9 pour r\u00e9pondre aux appels d'offres et RFP, MateriaBTP a forc\u00e9ment une solution pour vous.";
const audienceNewPlain =
  "MateriaBTP s'adresse aux entreprises du BTP qui r\u00e9pondent aux appels d'offres publics et priv\u00e9s. PME, ETAM ou structures multi-agences : si vous analysez des DCE et r\u00e9digez des m\u00e9moires techniques, l'outil est fait pour vous.";

const audienceOldHtml =
  "MateriaBTP est une plateforme d&#x27;IA modulaire qui s&#x27;adapte \u00e0 toutes les tailles d&#x27;entreprises, de la PME aux grands comptes. Si vous avez un minimum de volume et que vous ressentez le besoin d&#x27;\u00e9quiper vos \u00e9quipes d&#x27;un outil d\u00e9di\u00e9 pour r\u00e9pondre aux appels d&#x27;offres et RFP, MateriaBTP a forc\u00e9ment une solution pour vous.";
const audienceNewHtml =
  "MateriaBTP s&#x27;adresse aux entreprises du BTP qui r\u00e9pondent aux appels d&#x27;offres publics et priv\u00e9s. PME, ETAM ou structures multi-agences : si vous analysez des DCE et r\u00e9digez des m\u00e9moires techniques, l&#x27;outil est fait pour vous.";

body = body.replaceAll(audienceOldPlain, audienceNewPlain);
body = body.replaceAll(audienceOldHtml, audienceNewHtml);

const remaining = (body.match(/RFP/gi) || []).length;
console.log("remaining RFP:", remaining);
if (remaining > 0) {
  for (const m of body.matchAll(/[^\n]{0,90}RFP[^\n]{0,90}/gi)) {
    console.log("leftover:", m[0]);
  }
  process.exit(1);
}

const out = `/** Generated from index.html \u2014 ne pas editer a la main. Relancer: node scripts/extract-plumtech-landing.mjs */
export const PLUMTECH_INLINE_STYLE = ${JSON.stringify(PLUMTECH_INLINE_STYLE)};
export const PLUMTECH_BODY_HTML = ${JSON.stringify(body)};
export const PLUMTECH_MODAL_HTML = ${JSON.stringify(PLUMTECH_MODAL_HTML)};
`;

fs.writeFileSync(
  path.join("src", "components", "landing", "plumtech", "landing-markup.ts"),
  out,
  "utf8",
);
console.log("landing-markup.ts updated");
