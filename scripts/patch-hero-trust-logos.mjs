import fs from "fs";

let html = fs.readFileSync("index.html", "utf8");

const pattern =
  /<div><div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block"><p class="hero-trust-caption relative text-center font-display text-lead text-stone-800 px-stack">[^<]+<\/p><\/div><\/div>/;

const neu = `<div class="relative mx-auto mt-stack-sm flex w-full flex-col gap-stack-sm pb-block hero-centered__trust"><div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-white to-40% -top-block"></div><p class="hero-trust-caption relative text-center font-display text-lead text-stone-800 px-stack">Con�u pour les PME BTP qui r�pondent aux march�s publics et priv�s.</p><div class="relative flex flex-wrap items-center justify-center gap-stack-sm px-stack sm:gap-stack"><img src="./materiabtp-assets/images/logos/crit.svg" alt="Crit" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/diot_siaci.svg" alt="Diot Siaci" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/bunzl.svg" alt="Bunzl" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/bechtle.svg" alt="Bechtle" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/roux_tp.svg" alt="Roux TP" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/generix.svg" alt="Generix" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/><img src="./materiabtp-assets/images/logos/afpa.svg" alt="AFPA" class="block h-7 w-auto object-contain opacity-80 sm:h-9"/></div></div>`;

if (!pattern.test(html)) {
  console.error("Trust block introuvable");
  process.exit(1);
}

html = html.replace(pattern, neu);
fs.writeFileSync("index.html", html);
console.log("Logos trust hero ajoutes");
