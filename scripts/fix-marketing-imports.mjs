import fs from "node:fs";
import path from "node:path";

const roots = ["src/components/marketing", "src/lib/marketing", "src/app/(marketing)"];

const replacements = [
  ["@/components/ui/Logo", "@/components/marketing/ui/Logo"],
  ["@/components/ui/Container", "@/components/marketing/ui/Container"],
  ["@/components/ui/ArrowLink", "@/components/marketing/ui/ArrowLink"],
  ["@/components/ui/Reveal", "@/components/marketing/ui/Reveal"],
  ["@/components/home/", "@/components/marketing/home/"],
  ["@/components/layout/", "@/components/marketing/layout/"],
  ["@/components/page/", "@/components/marketing/page/"],
  ["@/lib/content/", "@/lib/marketing/content/"],
  ["@/lib/config/", "@/lib/marketing/config/"],
  ["https://app.tendercrunch.com/signin", "/login"],
  ["https://fr.linkedin.com/company/tendercrunch", "https://www.linkedin.com/company/materiabtp"],
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

let updated = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;
    for (const [from, to] of replacements) {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, content);
      updated += 1;
    }
  }
}

console.log(`Updated ${updated} files.`);
