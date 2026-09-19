import { LogoMark } from "@/components/marketing/ui/Logo";

/* ── Shell TenderCrunch-style : cadre blanc, header logo + titre ─────────── */

function MockupShell({
  title,
  children,
  initials = "RT",
  className = "max-w-md",
}: {
  title: string;
  children: React.ReactNode;
  initials?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full select-none overflow-hidden rounded bg-white shadow-mockup ring-1 ring-midnight/10 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-snow px-4 py-2">
        <span className="flex min-w-0 items-center gap-2">
          <LogoMark />
          <span className="truncate text-[11px] font-medium text-steel">{title}</span>
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-midnight text-[8px] font-bold text-white">
          {initials}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ── Analyse DCE : pièces + vigilance ──────────────────────────────────── */

export function AnalysisMockup() {
  return (
    <MockupShell title="Analyse du DCE › Réhabilitation groupe scolaire">
      <div className="flex">
        <div className="hidden w-36 shrink-0 border-r border-line/70 bg-snow p-3 sm:block">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-pewter">
            Pièces du DCE
          </p>
          <ul className="space-y-1 text-[11px] font-medium">
            <li className="flex items-center justify-between rounded px-2 py-1.5 text-steel">
              <span className="truncate">RC.pdf</span>
              <CheckSmall />
            </li>
            <li className="flex items-center justify-between rounded bg-iris/10 px-2 py-1.5 text-iris">
              <span className="truncate">CCAP.pdf</span>
              <span className="shrink-0 text-[10px] font-bold text-amber-600">1</span>
            </li>
            <li className="flex items-center justify-between rounded px-2 py-1.5 text-steel">
              <span className="truncate">CCTP.pdf</span>
              <CheckSmall />
            </li>
          </ul>
          <p className="mt-3 px-2 text-[10px] leading-relaxed text-pewter">
            3 pièces lues · 4 exigences
          </p>
        </div>
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-bold text-midnight">CCAP</p>
            <p className="shrink-0 text-[10px] font-medium text-pewter">Points de vigilance</p>
          </div>
          <ul className="mt-3 divide-y divide-line/70">
            <VigilanceItem
              text="Visite de site obligatoire avant remise de l'offre"
              source="RC · art. 5.2"
            />
            <VigilanceItem
              text="Planning détaillé exigé, compatible avec la période scolaire"
              source="CCTP · §3.4"
            />
            <li className="flex items-start gap-2.5 py-2.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              <span className="min-w-0">
                <span className="block text-[11px] font-medium leading-snug text-midnight">
                  Critères : valeur technique 60 % · prix 40 %
                </span>
                <span className="mt-0.5 block text-[10px] text-pewter">RC · art. 6.1</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </MockupShell>
  );
}

/* ── Mémoire technique : sommaire + chapitre ────────────────────────────── */

export function MemoryMockup() {
  return (
    <MockupShell title="Mémoire technique › Réhabilitation groupe scolaire">
      <div className="flex">
        <div className="hidden w-44 shrink-0 border-r border-line/70 bg-snow p-3 sm:block">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-pewter">
            Sommaire
          </p>
          <ul className="space-y-1 text-[11px] font-medium">
            <li className="flex items-center gap-2 rounded px-2 py-1.5 text-midnight/70">
              <CheckSmall /> Compréhension du besoin
            </li>
            <li className="flex items-center gap-2 rounded px-2 py-1.5 text-midnight/70">
              <CheckSmall /> Présentation de l&apos;entreprise
            </li>
            <li className="flex items-center gap-2 rounded bg-iris/10 px-2 py-1.5 text-iris">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center text-[9px]">3</span>
              Méthodologie et phasage
            </li>
            <li className="flex items-center gap-2 rounded px-2 py-1.5 text-pewter">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center text-[9px] text-pewter/70">4</span>
              Moyens humains
            </li>
          </ul>
          <p className="mt-3 px-2 text-[10px] text-pewter">62 % rédigé</p>
        </div>
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-bold text-midnight">3. Méthodologie et phasage</p>
            <p className="shrink-0 text-[10px] font-medium text-pewter">Valeur technique · 60 %</p>
          </div>
          <div className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-steel">
            <p>
              Les travaux sont phasés en 4 séquences compatibles avec la période scolaire : préparatoire,
              cloisons, plafonds, finitions
              <sup className="font-semibold text-iris"> [1]</sup>.
            </p>
            <p className="rounded border-l-2 border-iris bg-iris/[0.05] px-3 py-2 text-midnight/80">
              Intervention en zones découpées, travaux bruyants hors des horaires de classe
              <sup className="font-semibold text-iris"> [2]</sup>.
            </p>
          </div>
          <p className="mt-3 text-[10px] font-medium text-pewter">
            Premier jet · sources : [1] Méthode « chantier occupé », [2] CCTP §3.4
          </p>
        </div>
      </div>
    </MockupShell>
  );
}

/* ── Base entreprise : recherche ───────────────────────────────────────── */

export function CompanySearchMockup() {
  return (
    <MockupShell title="Base entreprise" className="">
      <div className="p-5">
        <div className="flex items-center gap-2.5 rounded bg-snow px-3.5 py-2.5 ring-1 ring-line">
          <SearchIcon />
          <span className="truncate text-xs font-medium text-midnight/80">
            travaux en site scolaire occupé
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold text-midnight">
            Méthode · Intervention en site scolaire occupé
          </p>
          <p className="text-[10px] leading-relaxed text-steel">
            Phasage par zones, travaux bruyants hors des heures de classe, protections des circulations…
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Références · 4", "Méthodes · 5", "Certifications · 2"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-snow px-2 py-0.5 text-[10px] font-medium text-steel ring-1 ring-line"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-medium text-pewter">
          Chaque résultat mène à sa fiche ou à son document
        </p>
      </div>
    </MockupShell>
  );
}

/* ── Tableau de bord : dossiers actifs ─────────────────────────────────── */

export function DashboardMockup() {
  return (
    <MockupShell title="Tableau de bord">
      <div className="p-5">
        <div className="flex gap-5 border-b border-line text-[11px]">
          <span className="-mb-px border-b-2 border-iris pb-2 font-semibold text-midnight">
            Dossiers actifs
          </span>
          <span className="pb-2 font-medium text-pewter">En attente</span>
          <span className="pb-2 font-medium text-pewter">Résultats</span>
        </div>
        <div className="py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[12px] font-semibold text-midnight">
              Réhabilitation groupe scolaire · Lyon
            </p>
            <p className="shrink-0 text-[11px] font-medium tabular-nums text-pewter">
              12 jours restants
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
              <div className="h-full w-[62%] rounded-full bg-iris" />
            </div>
            <span className="w-12 text-right text-[11px] font-bold tabular-nums text-midnight">
              62 %
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
            <span className="font-semibold text-emerald-700">GO · 78 / 100</span>
            <span className="text-pewter">Mémoire en rédaction</span>
          </div>
        </div>
        <p className="border-t border-line/70 pt-2.5 text-[10px] font-medium text-pewter">
          Exigences, mémoire, contrôle qualité, échéance
        </p>
      </div>
    </MockupShell>
  );
}

/* ── Fiche Go/No-Go (demo express) ─────────────────────────────────────── */

export function GoNoGoMockup() {
  const rows = [
    { label: "Date limite de remise", value: "18 avril 2026 — 12h00" },
    { label: "Durée d'exécution", value: "12 semaines", strong: true },
    { label: "Critères", value: "Technique 60 % · Prix 40 %" },
    { label: "Visite de site", value: "Obligatoire", tone: "warn" as const },
    { label: "Variantes", value: "Non autorisées" },
    { label: "Planning détaillé", value: "Exigé dans le mémoire", tone: "warn" as const },
  ];

  return (
    <div className="w-full max-w-md select-none overflow-hidden rounded bg-white shadow-mockup ring-1 ring-midnight/10">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-pewter">
          <LogoMark className="h-3.5 w-3.5 shrink-0 object-cover object-left" />
          Synthèse Go / No-Go
        </span>
        <span className="shrink-0 text-[10px] font-medium text-pewter">Dossier d&apos;exemple</span>
      </div>
      <div className="p-5">
        <p className="text-[13px] font-semibold leading-snug text-midnight">
          Réhabilitation d&apos;un groupe scolaire
        </p>
        <p className="mt-0.5 text-xs text-pewter">
          Ville de Lyon · Lot 2 — Cloisons / plafonds · 3 pièces
        </p>
        <dl className="mt-4 divide-y divide-line/70 border-y border-line/70">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-2">
              <dt className="text-xs text-pewter">{row.label}</dt>
              <dd
                className={`flex items-center gap-1.5 text-xs tabular-nums ${
                  row.tone === "warn"
                    ? "font-semibold text-amber-600"
                    : row.strong
                      ? "font-bold text-midnight"
                      : "font-semibold text-midnight/90"
                }`}
              >
                {row.tone === "warn" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center justify-between rounded bg-success/[0.08] px-4 py-3 ring-1 ring-success/15">
          <span className="flex items-center gap-2 text-[13px] font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-success" />
            GO recommandé
          </span>
          <span className="text-xs font-semibold tabular-nums text-emerald-700/80">
            Note d&apos;opportunité 78 / 100
          </span>
        </div>
        <p className="mt-3 text-[10px] text-pewter">
          Dans l&apos;application, chaque ligne renvoie à sa pièce et à sa page.
        </p>
      </div>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function CheckSmall() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3 w-3 shrink-0 text-success"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function VigilanceItem({ text, source }: { text: string; source: string }) {
  return (
    <li className="flex items-start gap-2.5 py-2.5">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
      <span className="min-w-0">
        <span className="block text-[11px] font-medium leading-snug text-midnight">{text}</span>
        <span className="mt-0.5 block text-[10px] text-pewter">{source} · voir la clause</span>
      </span>
    </li>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-pewter"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}
