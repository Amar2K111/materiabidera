import fs from "fs";

const htmlPath = "index.html";
let html = fs.readFileSync(htmlPath, "utf8");

/** Path swaps: stock photos → MateriaBTP product UI captures */
const pathSwaps = [
  [
    "./materiabtp-assets/images/home/problems.avif",
    "./materiabtp-assets/images/features/cards/analysis-fr.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/problems-480.avif",
    "./materiabtp-assets/images/_r/features/cards/analysis-fr-480.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/problems-640.avif",
    "./materiabtp-assets/images/_r/features/cards/analysis-fr-640.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/problems-960.avif",
    "./materiabtp-assets/images/_r/features/cards/analysis-fr-960.avif",
  ],
  [
    "./materiabtp-assets/images/home/social-proof.avif",
    "./materiabtp-assets/images/hero/dashboard-fr.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/social-proof-480.avif",
    "./materiabtp-assets/images/_r/hero/dashboard-fr-480.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/social-proof-640.avif",
    "./materiabtp-assets/images/_r/hero/dashboard-fr-640.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/social-proof-960.avif",
    "./materiabtp-assets/images/_r/hero/dashboard-fr-960.avif",
  ],
  [
    "./materiabtp-assets/images/_r/home/social-proof-1440.avif",
    "./materiabtp-assets/images/_r/hero/dashboard-fr-1440.avif",
  ],
  [
    "./materiabtp-assets/images/faq.avif",
    "./materiabtp-assets/images/features/cards/knowledge-base-fr.avif",
  ],
  [
    "./materiabtp-assets/images/_r/faq-480.avif",
    "./materiabtp-assets/images/_r/features/cards/knowledge-base-fr-480.avif",
  ],
];

for (const [from, to] of pathSwaps) {
  html = html.split(from).join(to);
}

// srcset width tokens tied to old masters
html = html
  .split("./materiabtp-assets/images/features/cards/analysis-fr.avif 1024w")
  .join(
    "./materiabtp-assets/images/_r/features/cards/analysis-fr-1440.avif 1440w, ./materiabtp-assets/images/features/cards/analysis-fr.avif 1440w",
  );
html = html
  .split("./materiabtp-assets/images/hero/dashboard-fr.avif 1472w")
  .join("./materiabtp-assets/images/hero/dashboard-fr.avif 1440w");
html = html
  .split("./materiabtp-assets/images/features/cards/knowledge-base-fr.avif 505w")
  .join(
    "./materiabtp-assets/images/_r/features/cards/knowledge-base-fr-640.avif 640w, ./materiabtp-assets/images/_r/features/cards/knowledge-base-fr-960.avif 960w, ./materiabtp-assets/images/features/cards/knowledge-base-fr.avif 1440w",
  );

const altSwaps = [
  [
    'alt="Équipe BTP analysant un DCE volumineux avant la remise du mémoire technique"',
    'alt="Capture MateriaBTP : analyse structurée d\'un DCE (RC, CCTP, critères de jugement)"',
  ],
  [
    "alt=\"Équipe BTP analysant un DCE volumineux avant la remise du mémoire technique\"",
    "alt=\"Capture MateriaBTP : analyse structurée d'un DCE (RC, CCTP, critères de jugement)\"",
  ],
  [
    'alt="Équipe bid passant en revue les résultats d&#x27;un appel d&#x27;offres"',
    'alt="Capture MateriaBTP : tableau de bord de suivi des dossiers appels d\'offres"',
  ],
  [
    "alt=\"Équipe bid passant en revue les résultats d'un appel d'offres\"",
    "alt=\"Capture MateriaBTP : tableau de bord de suivi des dossiers appels d'offres\"",
  ],
  [
    'alt="" width="505" height="542"',
    'alt="Capture MateriaBTP : base entreprise (moyens, références et méthodes)" width="505" height="542"',
  ],
];

for (const [from, to] of altSwaps) {
  html = html.split(from).join(to);
}

// RSC escaped strings
html = html
  .split("Équipe BTP analysant un DCE volumineux avant la remise du mémoire technique")
  .join(
    "Capture MateriaBTP : analyse structurée d'un DCE (RC, CCTP, critères de jugement)",
  );
html = html
  .split("Équipe bid passant en revue les résultats d'un appel d'offres")
  .join(
    "Capture MateriaBTP : tableau de bord de suivi des dossiers appels d'offres",
  );
html = html
  .split("Équipe bid passant en revue les résultats d\\'un appel d\\'offres")
  .join(
    "Capture MateriaBTP : tableau de bord de suivi des dossiers appels d'offres",
  );

html = html.replace(
  /class="absolute inset-0 size-full object-cover"(?=\/><\/div><\/div><\/div><div class="flex flex-col gap-stack-sm)/g,
  'class="absolute inset-0 size-full object-cover object-top"',
);
html = html.replace(
  /class="absolute inset-0 size-full object-cover"(?=\/><\/div><\/div><\/div><\/div><\/div><\/section><section class="relative isolate overflow-clip b)/g,
  'class="absolute inset-0 size-full object-cover object-top"',
);
html = html.replace(
  /class="absolute inset-x-0 top-0 h-\[clamp\(20cqi,80%,35cqi\)\] w-full rounded-xl border border-stone-400 object-cover"/g,
  'class="absolute inset-x-0 top-0 h-[clamp(20cqi,80%,35cqi)] w-full rounded-xl border border-stone-400 object-cover object-top"',
);
html = html.replace(
  'class="relative w-full rounded-3xl object-cover"',
  'class="relative w-full rounded-3xl object-cover object-top"',
);

if (html.includes("home/problems") || html.includes("home/social-proof")) {
  throw new Error("Some old image paths remain");
}
if (!html.includes("features/cards/analysis-fr.avif")) {
  throw new Error("Analysis image not applied");
}

fs.writeFileSync(htmlPath, html);
console.log("landing section images → MateriaBTP product captures");
