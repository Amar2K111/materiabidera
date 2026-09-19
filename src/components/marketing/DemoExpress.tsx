"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/marketing/ui/Container";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { GoNoGoMockup } from "@/components/marketing/marketing-mockups";

const analysisSteps = [
  { at: 500, label: "Règlement de consultation lu", detail: "Critères de jugement et pondération relevés" },
  { at: 1300, label: "CCAP lu", detail: "Visite de site obligatoire : point de vigilance", warn: true },
  { at: 2100, label: "CCTP lu", detail: "4 exigences relevées, chacune avec sa page" },
  { at: 2800, label: "Base entreprise consultée", detail: "Références et qualifications confrontées au dossier" },
  { at: 3400, label: "Évaluation Go/No-Go calculée", detail: "Huit facteurs justifiés, sources à l'appui" },
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function DemoExpress() {
  const [runStatus, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [runSteps, setStepCount] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const status = reducedMotion ? "done" : runStatus;
  const stepCount = reducedMotion ? analysisSteps.length : runSteps;
  const [runKey, setRunKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runningRef = useRef(false);
  const hasPlayedOnceRef = useRef(false);

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
        hasPlayedOnceRef.current = true;
        setStatus("done");
      }, 3700),
    );
  }, []);

  const replay = useCallback(() => {
    runningRef.current = false;
    runAnalysis();
  }, [runAnalysis]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

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
  }, [runAnalysis, reducedMotion]);

  const progress =
    status === "done"
      ? 100
      : status === "running"
        ? Math.min((stepCount / analysisSteps.length) * 100, 95)
        : 0;

  const buttonLabel =
    status === "done" || (hasPlayedOnceRef.current && status === "running")
      ? "Rejouer"
      : "Lancer l'analyse";

  return (
    <section className="dotgrid bg-snow" id="demo-express">
      <Container className="py-14 lg:py-20">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pewter">Démo express</p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.02em] text-midnight lg:text-[2.5rem] lg:leading-[1.15]">
            Regardez un DCE se faire analyser
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-steel">
            Trente secondes, zéro compte à créer. Pour la vraie version : votre propre dossier, en démonstration.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div
            ref={sectionRef}
            className="mt-12 grid overflow-hidden rounded border border-line shadow-soft ring-1 ring-midnight/10 lg:grid-cols-[1fr_1.05fr]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (status === "done") replay();
              else {
                runningRef.current = false;
                runAnalysis();
              }
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
                        dce_groupe_scolaire_lyon.zip
                      </span>
                      <span className="block text-[11px] text-pewter">3 pièces · RC, CCAP, CCTP</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={status === "done" ? replay : runAnalysis}
                    disabled={status === "running"}
                    className="arrow-link inline-flex shrink-0 items-center gap-1.5 rounded bg-iris px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-iris-hover disabled:cursor-wait disabled:opacity-70"
                  >
                    {buttonLabel}
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>

                <ol aria-live="polite" className="mt-6 min-h-[15rem] space-y-3.5">
                  {status === "idle" && (
                    <li className="list-none px-1 pt-2 text-[14px] leading-relaxed text-steel">
                      1. Analyse simulée du dossier d&apos;exemple ci-dessus. Déposez n&apos;importe quoi ici pour la relancer : rien n&apos;est envoyé.
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
                <GoNoGoMockup />
              ) : (
                <div className="w-full max-w-md rounded border-2 border-dashed border-line p-10 text-center">
                  <p className="text-[15px] font-semibold text-steel">La synthèse Go/No-Go apparaîtra ici</p>
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
