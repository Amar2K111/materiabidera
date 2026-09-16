import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

// Push labels further from dashed wireframe borders
const labelAdjustments = [
  [
    'style="left:4.5%;top:16%;width:23%;height:24%;padding:0.75rem 0.5rem 0.5rem 0.25rem"',
    'style="left:7%;top:18.5%;width:20%;height:22%;padding:1.1rem 1rem 0.75rem 0.85rem"',
  ],
  [
    'style="left:4.5%;top:43%;width:23%;height:9%;padding:0.5rem 0.5rem 0.25rem 0.25rem"',
    'style="left:7%;top:44.8%;width:20%;height:8%;padding:0.85rem 1rem 0.5rem 0.85rem"',
  ],
  [
    'style="left:72.5%;top:48%;width:23%;height:20%;padding:0.75rem 0.25rem 0.5rem 0.5rem"',
    'style="left:73%;top:49.5%;width:20%;height:18%;padding:1.1rem 0.85rem 0.75rem 1rem"',
  ],
  [
    'style="left:72.5%;top:71.5%;width:23%;height:10%;padding:0.5rem 0.25rem 0.25rem 0.5rem"',
    'style="left:73%;top:72.8%;width:20%;height:8%;padding:0.85rem 0.85rem 0.5rem 1rem"',
  ],
];

// Inset gradient panels slightly inside wireframe cells
const panelAdjustments = [
  [
    'style="left:1.34%;top:14.52%;width:28.5%;height:26.44%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
    'style="left:3.2%;top:15.8%;width:25%;height:24%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  ],
  [
    'style="left:1.34%;top:40.95%;width:28.5%;height:11.48%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
    'style="left:3.2%;top:42.1%;width:25%;height:9.8%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  ],
  [
    'style="left:70.15%;top:46.16%;width:28.5%;height:23.4%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
    'style="left:71.8%;top:47.4%;width:25%;height:21%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  ],
  [
    'style="left:70.15%;top:69.56%;width:28.5%;height:13.22%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
    'style="left:71.8%;top:70.7%;width:25%;height:11.5%;background-image:linear-gradient(180deg, rgba(145, 145, 87, 0.06) -39.35%, rgba(121, 46, 241, 0.08) 175%)"',
  ],
];

for (const [from, to] of [...labelAdjustments, ...panelAdjustments]) {
  if (!html.includes(from)) {
    console.error("missing pattern:", from.slice(0, 80));
    process.exit(1);
  }
  html = html.replace(from, to);
}

fs.writeFileSync("index.html", html);
console.log("diagram spacing increased");
