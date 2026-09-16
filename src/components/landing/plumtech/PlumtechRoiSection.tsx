"use client";

import { useCallback, useMemo, useState } from "react";

const GAIN_RATE = 0.35;

const BENEFITS = [
  {
    label: "Analyse DCE",
    detail: "RC, CCTP, CCAP lus et structur\u00e9s en quelques minutes",
  },
  {
    label: "Go / No-Go",
    detail: "D\u00e9cision argument\u00e9e, sans repartir de z\u00e9ro \u00e0 chaque dossier",
  },
  {
    label: "M\u00e9moire technique",
    detail: "Plan align\u00e9 sur le RC, contenu trac\u00e9 \u00e0 votre base entreprise",
  },
];

function rangeFill(value: number, min: number, max: number) {
  return `${((value - min) / (max - min)) * 100}%`;
}

export function PlumtechRoiSection() {
  const [dossiers, setDossiers] = useState(12);
  const [hours, setHours] = useState(20);

  const savedHours = useMemo(
    () => Math.round(dossiers * hours * GAIN_RATE),
    [dossiers, hours],
  );
  const savedDays = useMemo(() => Math.round(savedHours / 8), [savedHours]);

  const dossiersFill = rangeFill(dossiers, 1, 40);
  const hoursFill = rangeFill(hours, 8, 50);

  const onDossiers = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDossiers(Number(e.target.value));
  }, []);

  const onHours = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHours(Number(e.target.value));
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-16 text-[var(--mb-body)] md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(var(--mb-primary-rgb),0.07),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-meta uppercase text-primary">Gain de temps</p>
          <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.35rem)] font-bold leading-tight text-[var(--mb-ink)]">
            Combien d&apos;heures r{"\u00e9"}cup{"\u00e9"}rez-vous{" "}
            <span className="text-[var(--mb-muted)]">sur vos appels d&apos;offres ?</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--mb-muted)]">
            Ajustez votre volume de dossiers BTP et le temps pass{"\u00e9"} du DCE au
            m{"\u00e9"}moire technique. Estimation indicative sur les phases assist
            {"\u00e9"}es par MateriaBTP.
          </p>
        </div>

        <div className="plumtech-roi-card grid gap-8 rounded-[30px] bg-white p-6 md:p-8 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-stretch">
          <div className="flex flex-col justify-center gap-6">
            <div className="plumtech-roi-field">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <label
                  htmlFor="roi-dossiers"
                  className="text-sm font-semibold text-[var(--mb-ink)]"
                >
                  Dossiers AO par an
                </label>
                <span className="plumtech-roi-badge">{dossiers}</span>
              </div>
              <input
                id="roi-dossiers"
                type="range"
                min={1}
                max={40}
                step={1}
                value={dossiers}
                onChange={onDossiers}
                className="plumtech-roi-range w-full"
                style={{ "--roi-fill": dossiersFill } as React.CSSProperties}
                aria-label="Nombre de dossiers appels d'offres par an"
              />
              <p className="mt-2 text-xs text-[var(--mb-subtle)]">
                March{"\u00e9"}s publics et priv{"\u00e9"}s confondus
              </p>
            </div>

            <div className="plumtech-roi-field">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <label
                  htmlFor="roi-hours"
                  className="text-sm font-semibold text-[var(--mb-ink)]"
                >
                  Heures par dossier
                </label>
                <span className="plumtech-roi-badge">{hours} h</span>
              </div>
              <input
                id="roi-hours"
                type="range"
                min={8}
                max={50}
                step={2}
                value={hours}
                onChange={onHours}
                className="plumtech-roi-range w-full"
                style={{ "--roi-fill": hoursFill } as React.CSSProperties}
                aria-label={"Heures pass\u00e9es par dossier, du DCE au m\u00e9moire"}
              />
              <p className="mt-2 text-xs text-[var(--mb-subtle)]">
                De la premi{"\u00e8"}re lecture du DCE {"\u00e0"} l&apos;export Word / PDF
              </p>
            </div>
          </div>

          <div className="plumtech-roi-result flex flex-col justify-center rounded-[30px] px-6 py-8 text-center md:px-8">
            <p className="text-sm font-medium">
              Par an, votre {"\u00e9"}quipe r{"\u00e9"}cup{"\u00e8"}re environ
            </p>
            <div className="mt-5 flex items-end justify-center gap-6">
              <div>
                <p className="font-display text-[clamp(2.5rem,6vw,3.5rem)] font-bold leading-none text-white">
                  {savedHours}
                  <span className="ml-1 text-2xl font-semibold">h</span>
                </p>
                <p className="mt-2 text-sm">
                  {"\u00e9"}conomis{"\u00e9"}es
                </p>
              </div>
              <span className="pb-3 text-2xl font-light">=</span>
              <div>
                <p className="font-display text-[clamp(2.5rem,6vw,3.5rem)] font-bold leading-none text-white">
                  {savedDays}
                </p>
                <p className="mt-2 text-sm">jours ouvr{"\u00e9"}s</p>
              </div>
            </div>
            <p className="mt-6 text-xs leading-relaxed">
              ~{Math.round(GAIN_RATE * 100)} % de gain estim{"\u00e9"} sur analyse,
              exigences et r{"\u00e9"}daction assist{"\u00e9"}e. Vous validez chaque
              contenu g{"\u00e9"}n{"\u00e9"}r{"\u00e9"}.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((item) => (
            <div
              key={item.label}
              className="rounded-[30px] border border-[rgba(var(--mb-primary-rgb),0.1)] bg-[var(--mb-surface)] px-4 py-4"
            >
              <p className="font-semibold text-[var(--mb-ink)]">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--mb-muted)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
