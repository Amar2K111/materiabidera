const fs = require("fs");

function audit(file, label) {
  const h = fs.readFileSync(file, "utf8");
  const gridStart = h.indexOf('class="relative max-w-7xl mx-auto min-h-[60vh]');
  const sandStart = h.indexOf("bg-sand-0", gridStart);
  const chunk = h.slice(gridStart, sandStart > 0 ? sandStart : gridStart + 12000);

  // walk div tags with positions
  const tags = [];
  const re = /<\/?div[^>]*>/g;
  let m;
  while ((m = re.exec(chunk))) {
    tags.push({ pos: gridStart + m.index, tag: m[0].slice(0, 80) });
  }
  let depth = 0;
  const stack = [];
  for (const t of tags) {
    const isClose = t.tag.startsWith("</div");
    if (isClose) {
      depth--;
      stack.pop();
      if (depth < 0) {
        console.log(label, "EXTRA CLOSE at", t.pos, t.tag);
        depth = 0;
      }
    } else {
      depth++;
      stack.push(t);
    }
  }
  console.log(label, "final depth:", depth, "unclosed:", stack.length);
  if (stack.length) console.log("  last open:", stack[stack.length - 1].tag);

  const mobile = chunk.indexOf("w-full sm:hidden");
  if (mobile > 0) {
    console.log(label, "after mobile img:", chunk.slice(mobile, mobile + 350).replace(/\s+/g, " "));
  }

  const trust = chunk.indexOf("relative mx-auto mt-stack-sm");
  console.log(label, "trust band in chunk:", trust > 0 ? "YES inside grid" : "NO (outside grid)");
}

audit("index.html", "materia");
audit("tenderbolt-fr.html", "tenderbolt");
