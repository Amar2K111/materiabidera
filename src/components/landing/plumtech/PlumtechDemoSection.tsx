"use client";

import { useState } from "react";
import { CAPTURE_ANALYSIS } from "@/lib/marketing/capture-mock-data";

const STEPS = [
  "Lecture du RC et des criteres de jugement\u2026",
  "Extraction CCTP / CCAP et exigences obligatoires\u2026",
  "Confrontation a votre base entreprise\u2026",
  "Synthese Go / No-Go argumentee\u2026",
];

export function PlumtechDemoSection() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);

  async function runDemo() {
    if (running) return;
    setRunning(true);
    setDone(false);
    setStep(0);

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 900));
    }

    setDone(true);
    setRunning(false);
  }

  const progress = done ? 100 : step < 0 ? 0 : Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <section className="plumtech-section px-6 py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-4">
          <p className="text-meta uppercase text-primary">Demo express</p>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight text-[var(--mb-ink)]">
            Regardez un DCE BTP se faire analyser
          </h2>
          <p className="max-w-xl text-[15px] leading-relaxed text-[var(--mb-muted)]">
            Trente secondes, sans compte. Puis en demo : votre propre DCE, RC, CCTP
            et CCAP, avec une recommandation Go / No-Go trac\u00e9e.
          </p>

          <div className="plumtech-demo-card rounded-[30px] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-wash text-lg">
                {"\uD83D\uDCC4"}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--mb-ink)]">
                  DCE_rehabilitation_scolaire.zip
                </p>
                <p className="text-sm text-[var(--mb-muted)]">
                  14 pieces \u00b7 RC, CCAP, CCTP, DPGF, annexes
                </p>
              </div>
            </div>
            <button
              type="button"
              data-no-calendly
              onClick={(event) => {
                event.stopPropagation();
                void runDemo();
              }}
              disabled={running}
              className="plumtech-demo-run mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--mb-accent)] disabled:opacity-70"
            >
              {running ? "Analyse en cours\u2026" : "Lancer l\u2019analyse \u2192"}
            </button>
            <p className="mt-3 text-xs text-[var(--mb-subtle)]">
              Demonstration simulee dans votre navigateur. Aucun document n&apos;est
              envoye.
            </p>
          </div>
        </div>

        <div className="plumtech-demo-card rounded-[30px] bg-white p-6">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[var(--mb-mist)]">
            <div
              className="plumtech-demo-progress h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!done ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--mb-muted)]">
                {step < 0
                  ? "La fiche synthese Go / No-Go apparaitra ici."
                  : STEPS[step]}
              </p>
              <ul className="space-y-2 text-sm text-[var(--mb-subtle)]">
                {STEPS.map((label, i) => (
                  <li
                    key={label}
                    className={i <= step ? "text-[var(--mb-primary)]" : undefined}
                  >
                    {i <= step ? "\u2713 " : "\u2022 "}
                    {label.replace("\u2026", "")}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-[var(--mb-ink)]">
                  Fiche synthese Go / No-Go
                </h3>
                <span className="rounded-full bg-brand-wash px-3 py-1 text-xs font-bold text-primary">
                  Recommandation : Go
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Item label="Objet" value={CAPTURE_ANALYSIS.subject} />
                <Item label="Acheteur" value={CAPTURE_ANALYSIS.buyer} />
                <Item label="Lot" value={CAPTURE_ANALYSIS.lot} />
                <Item label="Remise" value={CAPTURE_ANALYSIS.submission_date} />
              </dl>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mb-muted)]">
                  Points de vigilance (CCAP / CCTP)
                </p>
                <ul className="space-y-2">
                  {CAPTURE_ANALYSIS.vigilance_points.map((p) => (
                    <li
                      key={p.title}
                      className="rounded-[30px] border border-[rgba(var(--mb-primary-rgb),0.1)] bg-[var(--mb-wash)] px-3 py-2 text-sm text-[var(--mb-ink-70)]"
                    >
                      <span className="font-semibold text-[var(--mb-ink)]">
                        {p.title}
                      </span>
                      {" \u2014 "}
                      {p.detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Item({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[var(--mb-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[var(--mb-ink-70)]">
        {value ?? "\u2014"}
      </dd>
    </div>
  );
}
