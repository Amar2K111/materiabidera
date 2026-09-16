"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Square, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Chapter = { id: string; title: string };

type Failure = Chapter & { message: string };

export type WriteAllState = {
  running: boolean;
  /** Arret demande : le chapitre en cours se termine, les suivants ne partent pas. */
  stopping: boolean;
  queue: Chapter[];
  /** Indice du chapitre en cours de redaction dans la file. */
  current: number;
  written: string[];
  failed: Failure[];
  /** Vrai une fois la file terminee ou arretee, jusqu'a fermeture du bilan. */
  finished: boolean;
};

const IDLE: WriteAllState = {
  running: false,
  stopping: false,
  queue: [],
  current: 0,
  written: [],
  failed: [],
  finished: false,
};

/** Attente avant nouvel essai quand le moteur est sature. */
const RETRY_DELAYS_MS = [20_000, 45_000];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Redaction de tout le memoire en un clic.
 *
 * Les chapitres sont rediges l'un apres l'autre, dans l'ordre du plan : chacun
 * s'appuie sur ceux deja ecrits pour rester coherent (effectifs, delais,
 * moyens). Un seul appel pour tout le memoire depasserait la duree maximale
 * d'une requete ; la file est donc pilotee depuis la page, qui affiche chaque
 * chapitre des qu'il est pret. Un chapitre en echec n'arrete pas les autres.
 */
export function useWriteAll({
  projectId,
  onChapterWritten,
}: {
  projectId: string;
  onChapterWritten: (sectionId: string, toConfirm: string[]) => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<WriteAllState>(IDLE);
  const stopRef = useRef(false);
  const runningRef = useRef(false);

  // Quitter la page interromprait la redaction : on demande confirmation.
  useEffect(() => {
    if (!state.running) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.running]);

  const start = useCallback(
    async (chapters: Chapter[]) => {
      if (runningRef.current || chapters.length === 0) return;
      runningRef.current = true;
      stopRef.current = false;
      setState({ ...IDLE, running: true, queue: chapters });

      for (const [index, chapter] of chapters.entries()) {
        if (stopRef.current) break;
        setState((s) => ({ ...s, current: index }));

        let message: string | null = null;
        for (let attempt = 0; ; attempt += 1) {
          try {
            const response = await fetch(`/api/projects/${projectId}/run`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation: "section",
                sectionId: chapter.id,
                action: "generate",
              }),
            });
            const payload = await response.json().catch(() => ({}));

            if (response.ok) {
              onChapterWritten(chapter.id, payload.outcome?.toConfirm ?? []);
              message = null;
              break;
            }
            // Moteur momentanement sature : on patiente puis on reessaie.
            if (
              response.status === 429 &&
              attempt < RETRY_DELAYS_MS.length &&
              !stopRef.current
            ) {
              await wait(RETRY_DELAYS_MS[attempt]);
              continue;
            }
            message = payload.message ?? "La rédaction n'a pas pu aboutir.";
          } catch {
            message = "La rédaction n'a pas pu aboutir (connexion interrompue).";
          }
          break;
        }

        if (message) {
          const failure = { ...chapter, message };
          setState((s) => ({ ...s, failed: [...s.failed, failure] }));
        } else {
          setState((s) => ({ ...s, written: [...s.written, chapter.id] }));
          // Le chapitre s'affiche des qu'il est pret, sans attendre la fin.
          router.refresh();
        }
      }

      runningRef.current = false;
      setState((s) => ({ ...s, running: false, stopping: false, finished: true }));
      router.refresh();
    },
    [projectId, onChapterWritten, router],
  );

  const stop = useCallback(() => {
    stopRef.current = true;
    setState((s) => ({ ...s, stopping: true }));
  }, []);

  const dismiss = useCallback(() => setState(IDLE), []);

  return { state, start, stop, dismiss };
}

/** Progression, puis bilan, de la redaction complete. */
export function WriteAllProgress({
  projectId,
  state,
  onStop,
  onDismiss,
  onResume,
  memoWritten,
  memoTotal,
}: {
  projectId: string;
  state: WriteAllState;
  /** Chapitres rediges et total du memoire, au-dela de la seule file en cours. */
  memoWritten: number;
  memoTotal: number;
  onStop: () => void;
  onDismiss: () => void;
  onResume: () => void;
}) {
  if (!state.running && !state.finished) return null;

  const total = state.queue.length;
  const processed = state.written.length + state.failed.length;
  const pct = total === 0 ? 0 : Math.round((processed / total) * 100);
  const currentChapter = state.queue[state.current];
  const incomplete = state.failed.length > 0 || processed < total;

  return (
    <section
      className={cn(
        "rounded-[14px] border bg-white p-5 shadow-card",
        state.running ? "border-brand/25" : incomplete ? "border-warn/35" : "border-ok/30",
      )}
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {state.running ? (
            <>
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                <Loader2 className="h-4 w-4 flex-none animate-spin text-brand" strokeWidth={2} />
                Rédaction du mémoire : chapitre {Math.min(state.current + 1, total)} sur {total}
              </p>
              <p className="mt-1 truncate text-[13px] text-ink-58">
                {state.stopping
                  ? "Arrêt demandé : le chapitre en cours se termine."
                  : currentChapter
                    ? `En cours : ${currentChapter.title}`
                    : ""}
              </p>
              <p className="mt-1 text-[12px] text-ink-42">
                Environ 30 secondes par chapitre. Gardez cette page ouverte : chaque
                chapitre s&apos;affiche dès qu&apos;il est prêt.
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                {incomplete ? (
                  <TriangleAlert className="h-4 w-4 flex-none text-warn" strokeWidth={2} />
                ) : (
                  <CheckCircle2 className="h-4 w-4 flex-none text-ok" strokeWidth={2} />
                )}
                {incomplete
                  ? `${state.written.length} chapitre${state.written.length > 1 ? "s" : ""} rédigé${state.written.length > 1 ? "s" : ""} sur ${total}${processed < total ? " : rédaction arrêtée" : ""}`
                  : `Mémoire rédigé : ${memoWritten} chapitre${memoWritten > 1 ? "s" : ""} sur ${memoTotal}`}
              </p>
              {state.failed.length > 0 ? (
                <ul className="mt-2 space-y-1 text-[13px] text-ink-70">
                  {state.failed.map((f) => (
                    <li key={f.id}>
                      <span className="font-medium">{f.title}</span> : {f.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[13px] text-ink-58">
                  {incomplete
                    ? "Les chapitres restants peuvent être rédigés à tout moment."
                    : "Relisez les chapitres, complétez les points signalés « à compléter », puis lancez le contrôle avant la remise."}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-none flex-wrap gap-2">
          {state.running ? (
            <Button variant="ghost" size="sm" onClick={onStop} disabled={state.stopping}>
              <Square className="h-3.5 w-3.5" strokeWidth={2} />
              {state.stopping ? "Arrêt en cours…" : "Arrêter"}
            </Button>
          ) : (
            <>
              {incomplete ? (
                <Button size="sm" onClick={onResume}>
                  Rédiger les chapitres restants
                </Button>
              ) : (
                <Link
                  href={`/app/dossiers/${projectId}/controle`}
                  className="inline-flex h-8 items-center rounded-full bg-brand px-3.5 text-[13px] font-semibold text-white hover:bg-brand-deep"
                >
                  Lancer le contrôle
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Fermer
              </Button>
            </>
          )}
        </div>
      </div>

      <span className="app-ui__bar mt-4 !block">
        <i style={{ width: `${pct}%` }} />
      </span>
    </section>
  );
}
