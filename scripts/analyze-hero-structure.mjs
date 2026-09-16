import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const sectionStart = html.indexOf('<section class="gradient-hero');
const sectionEnd = html.indexOf("</section>", sectionStart);
const section = html.slice(sectionStart, sectionEnd);

const containerStart = section.indexOf('<div class="mx-auto flex max-w-6xl flex-col gap-block px-stack">');
console.log("container at", containerStart);

let depth = 0;
for (let i = containerStart; i < section.length; i++) {
  if (section.slice(i, i + 4) === "<div") depth++;
  if (section.slice(i, i + 6) === "</div>") {
    depth--;
    if (depth === 0) {
      console.log("container closes at", i);
      console.log("after container:", section.slice(i, i + 120).replace(/\s+/g, " "));
      break;
    }
  }
}

const cardsAt = section.indexOf('<div class="grid grid-cols-1 gap-6 md:grid-cols-3">');
console.log("cards at", cardsAt, "inside container?", cardsAt < section.indexOf("</div>", containerStart));
