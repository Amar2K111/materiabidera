const fs = require("fs");

function extract(file) {
  const h = fs.readFileSync(file, "utf8");
  const start = h.indexOf('<div class="mb-auto flex flex-col gap-section">');
  const end = h.indexOf('<div class="sticky bottom-0 z-20', start);
  return h.slice(start, end);
}

function skeleton(html) {
  return html
    .replace(/MateriaBTP|Tenderbolt|BTP|500 entreprises[^<]*/g, "X")
    .replace(/\.\/materiabtp-assets[^"']+/g, "/PATH")
    .replace(/\/images[^"']+/g, "/PATH")
    .replace(/\s+/g, " ")
    .replace(/><\/div>/g, ">↵</div>")
    .replace(/><div/g, ">\n<div");
}

const m = extract("index.html");
const t = extract("tenderbolt-fr.html");
console.log("materia len", m.length, "tenderbolt len", t.length);

// Compare div open/close sequence only
function divSeq(html) {
  const seq = [];
  const re = /<\/?div[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    const cls = (m[0].match(/class="([^"]*)"/) || [])[1] || "";
    const key = cls.split(" ").slice(0, 2).join(" ") || (m[0].startsWith("</") ? "/div" : "div");
    seq.push(m[0].startsWith("</") ? "-" + key : "+" + key);
  }
  return seq;
}

const ms = divSeq(m);
const ts = divSeq(t);
console.log("materia divs", ms.length, "tenderbolt divs", ts.length);
for (let i = 0; i < Math.max(ms.length, ts.length); i++) {
  if (ms[i] !== ts[i]) {
    console.log("diff at", i, "M:", ms[i], "T:", ts[i]);
    console.log("context M:", ms.slice(Math.max(0, i - 2), i + 3));
    console.log("context T:", ts.slice(Math.max(0, i - 2), i + 3));
    break;
  }
}
if (ms.join("|") === ts.join("|")) console.log("div sequences IDENTICAL");
