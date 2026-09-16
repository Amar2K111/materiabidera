const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");

function show(label, needle, before = 200, after = 1200) {
  const i = h.indexOf(needle);
  console.log("\n===", label, "at", i, "===");
  if (i < 0) return;
  console.log(h.slice(i - before, i + after).replace(/\s+/g, " "));
}

show("footer logo", 'footer class="border-t');
show("footer link", '<a class="flex shrink-0 items-center gap-3"');
show("par appel", "Par appel d'offres");
show("secteurs", ">Secteurs</h3>");
show("cta h2", "Pendant que vos concurrents");
show("social proof", "Ne nous croyez pas sur parole. Testez-nous");
show("calc section", "Les chiffres parlent");

// find stray <
const socialStart = h.indexOf("Ne nous croyez pas sur parole. Testez-nous");
const socialEnd = h.indexOf("Questions fréquentes", socialStart);
const social = h.slice(socialStart - 500, socialEnd);
const stray = social.match(/[^<]&lt;[^;]|[^<]<(?!\/?(?:div|section|p|h[1-6]|span|a|button|svg|path|article|ul|li|img|style|script|link|meta|html|head|body|main|footer|header|nav|input|label|br|hr|figure|figcaption|blockquote|cite|strong|em|small|time|table|thead|tbody|tr|td|th|form|textarea|select|option|iframe|video|source|picture|template|slot|details|summary|wbr|circle|rect|line|polyline|polygon|ellipse|g|defs|clipPath|mask|pattern|linearGradient|radialGradient|stop|use|symbol|text|tspan)[\s>/])/g);
console.log("\nstray < in social:", stray?.slice(0, 5));

// calc image in tenderbolt
const tb = fs.readFileSync("tenderbolt-fr.html", "utf8");
const calcTb = tb.indexOf("Les chiffres parlent");
console.log("\n=== TB calc ===");
console.log(tb.slice(calcTb, calcTb + 3500).replace(/\s+/g, " ").slice(0, 2000));
