import fs from "fs";

const { PLUMTECH_BODY_HTML } = await import(
  "../src/components/landing/plumtech/landing-markup.ts"
);

const statsIdx = PLUMTECH_BODY_HTML.indexOf("Les chiffres parlent");
const statsStart = PLUMTECH_BODY_HTML.lastIndexOf("<section", statsIdx);
const statsEnd = PLUMTECH_BODY_HTML.indexOf("</section>", statsIdx) + 10;
const before = PLUMTECH_BODY_HTML.slice(Math.max(0, statsStart - 200), statsStart);
const after = PLUMTECH_BODY_HTML.slice(statsEnd, statsEnd + 200);
console.log("BEFORE:", before);
console.log("AFTER:", after);
