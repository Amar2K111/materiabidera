"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { LogoMark } from "@/components/marketing/ui/Logo";

const analysisSteps = [
  { at: 500, label: "Règlement de consultation lu", detail: "Critères et pondération extraits" },
  { at: 1300, label: "CCAP analysé", detail: "Pénalités et points de vigilance remontés", warn: true },
  { at: 2100, label: "CCTP parcouru", detail: "42 exigences identifiées" },
  { at: 2800, label: "Montants reconstitués", detail: "Marqués ⭐ pour relecture" },
  { at: 3400, label: "Fiche Synthèse GoNoGo générée", detail: "Prête à partager" },
];

const goNoGoRows = [
  { label: "Date limite de remise", value: "28 juillet 2026 · 12h00", strong: true },
  { label: "Début d'exécution", value: "Octobre 2026" },
  { label: "Durée du marché", value: "48 mois", star: true },
  { label: "Montant estimé", value: "2,4 M€ HT", star: true },
  { label: "Visite de site", value: "Obligatoire · 30 juin" },
  { label: "Points de vigilance", value: "2 signalés", tone: "warn" as const },
  { label: "Variante", value: "Autorisée", tone: "ok" as const },
];

export function DemoExpress() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [stepCount, setStepCount] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runningRef = useRef(false);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const runAnalysis = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    clearTimers();
    setRunKey((k) => k + 1);
    setStatus("running");
    setStepCount(0);

    analysisSteps.forEach((step, index) => {
      timeoutsRef.current.push(
        setTimeout(() => setStepCount(index + 1), step.at),
      );
    });

    timeoutsRef.current.push(
      setTimeout(() => {
        runningRef.current = false;
        setStatus("done");
      }, 3700),
    );
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStepCount(analysisSteps.length);
      setStatus("done");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          runAnalysis();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runAnalysis]);

  const progress = status === "done" ? 100 : status === "running" ? Math.min((stepCount / analysisSteps.length) * 100, 95) : 0;

  return (
    <section className="dotgrid bg-snow" id="demo-express">
      <Container className="py-14 lg:py-20">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Démo express</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
            Regardez un DCE se faire analyser
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
            Trente secondes, zéro compte à créer. Et pour la vraie version : votre propre DCE, en démo.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div
            ref={sectionRef}
            className="mt-12 grid overflow-hidden rounded border border-line shadow-soft ring-1 ring-midnight/10 lg:grid-cols-[1fr_1.05fr]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              runAnalysis();
            }}
          >
            <div className="relative overflow-hidden bg-snow p-7 lg:p-9">
              <div className="relative">
                <div className="flex items-center justify-between gap-3 rounded border border-line bg-white px-4 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-iris text-[15px]" aria-hidden="true">
                      📄
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-[13px] font-semibold text-midnight">
                        DCE_renovation_eclairage.zip
                      </span>
                      <span className="block text-[11px] text-pewter">14 pièces · RC, CCAP, CCTP, annexes</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={runAnalysis}
                    className="cta-attn arrow-link inline-flex shrink-0 items-center gap-1.5 rounded bg-iris px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-iris-hover"
                  >
                    Lancer l&apos;analyse
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>

                <ol aria-live="polite" className="mt-6 min-h-[15rem] space-y-3.5">
                  {status === "idle" && (
                    <li className="list-none px-1 pt-2 text-[14px] leading-relaxed text-steel">
                      Analyse simulée des 14 pièces du DCE ci-dessus. Déposez n&apos;importe quoi ici pour la relancer.
                    </li>
                  )}
                  {analysisSteps.slice(0, stepCount).map((step) => (
                    <li key={`${runKey}-${step.label}`} className="flex items-start gap-3 text-[14px] leading-relaxed">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${step.warn ? "bg-amber-500" : "bg-success"}`}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="font-semibold text-midnight">{step.label}</span>
                        <span className="mt-0.5 block text-steel">{step.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 h-1 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-iris transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-4 text-[11px] text-pewter">
                  Démonstration simulée dans votre navigateur, aucun document n&apos;est envoyé.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center bg-white p-7 lg:p-9">
              {status === "done" ? (
                <GoNoGoCard />
              ) : (
                <div className="w-full max-w-md rounded border-2 border-dashed border-line p-10 text-center">
                  <p className="text-[15px] font-semibold text-steel">La Fiche Synthèse GoNoGo apparaîtra ici</p>
                  <p className="mt-1.5 text-[13px] text-pewter">
                    Dates clés, pénalités, points de vigilance, recommandation
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function GoNoGoCard() {
  return (
    <div className="w-full max-w-md select-none overflow-hidden rounded bg-white shadow-mockup ring-1 ring-midnight/10" aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-pewter">
          <LogoMark className="h-3.5 w-3.5 shrink-0 object-cover object-left" />
          Fiche Synthèse Go / No-Go
        </span>
        <span className="shrink-0 text-[10px] font-medium tabular-nums text-pewter">AO-2026-0412</span>
      </div>
      <div className="p-5">
        <p className="text-[13px] font-semibold leading-snug text-midnight">
          Rénovation des réseaux d&apos;éclairage public
        </p>
        <p className="mt-0.5 text-xs text-pewter">Marché public · Métropole régionale · DCE : 14 pièces</p>
        <dl className="mt-4 divide-y divide-line/70 border-y border-line/70">
          {goNoGoRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-2">
              <dt className="text-xs text-pewter">{row.label}</dt>
              <dd
                className={`flex items-center gap-1.5 text-xs tabular-nums ${
                  row.tone === "warn"
                    ? "font-semibold text-amber-600"
                    : row.tone === "ok"
                      ? "font-semibold text-success"
                      : row.strong
                        ? "font-bold text-midnight"
                        : "font-semibold text-midnight/90"
                }`}
              >
                {row.tone === "warn" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                {row.tone === "ok" && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                {row.value}
                {row.star && <StarIcon />}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center justify-between rounded bg-success/[0.08] px-4 py-3 ring-1 ring-success/15">
          <span className="flex items-center gap-2 text-[13px] font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-success" />
            GO recommandé
          </span>
          <span className="text-xs font-semibold tabular-nums text-emerald-700/80">Adéquation 87 / 100</span>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-pewter">
          <StarIcon />
          Donnée reconstituée par l&apos;IA · à vérifier avant remise
        </p>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="inline-block h-3.5 w-3.5 text-amber-400" fill="currentColor" aria-hidden="true">
      <path d="M10 1.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L2.2 7.5l5.4-.8L10 1.8z" />
    </svg>
  );
}
