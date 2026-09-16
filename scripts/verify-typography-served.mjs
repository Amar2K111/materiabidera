const html = await fetch("http://localhost:3000/").then((r) => r.text());
console.log("html css link:", html.match(/materia-plumtech-theme[^"']+/)?.[0]);

const css = await fetch(
  "http://localhost:3000/materiabtp-assets/materia-plumtech-theme.css?v=5",
).then((r) => r.text());
const marker = css.indexOf("Titres h2");
console.log("css h2 rule:", css.slice(marker, marker + 140));
