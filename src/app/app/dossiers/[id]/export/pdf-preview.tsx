"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PdfDocument = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (o: { scale: number }) => { width: number; height: number };
    render: (o: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
      canvas: HTMLCanvasElement;
    }) => { promise: Promise<void> };
  }>;
  destroy: () => Promise<void>;
};

/**
 * Charge pdfjs dans le navigateur, sans lecteur PDF integre : l'apercu
 * fonctionne partout, y compris sur les navigateurs qui n'affichent pas les
 * PDF (mobiles, navigateurs sans extension).
 */
async function loadPdfjs() {
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs");
  // Le module de traitement est execute dans la page ("worker" local) : aucune
  // URL de fichier a resoudre au deploiement.
  (globalThis as unknown as { pdfjsWorker: unknown }).pdfjsWorker = worker;
  return import("pdfjs-dist");
}

async function renderPage(doc: PdfDocument, number: number, canvas: HTMLCanvasElement, width: number) {
  const page = await doc.getPage(number);
  const base = page.getViewport({ scale: 1 });
  const ratio = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale: (width / base.width) * ratio });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${(viewport.height / viewport.width) * width}px`;
  const context = canvas.getContext("2d");
  if (!context) return;
  await page.render({ canvasContext: context, viewport, canvas }).promise;
}

/** Apercu du document final : miniatures de toutes les pages et page agrandie. */
export function PdfPreview({ data }: { data: Uint8Array }) {
  const [doc, setDoc] = useState<PdfDocument | null>(null);
  const [failed, setFailed] = useState(false);
  const [current, setCurrent] = useState(1);
  const bigRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const thumbs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    let loaded: PdfDocument | null = null;
    loadPdfjs()
      .then((pdfjs) => pdfjs.getDocument({ data: data.slice() }).promise)
      .then((pdf) => {
        loaded = pdf as unknown as PdfDocument;
        if (!cancelled) setDoc(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      void loaded?.destroy();
    };
  }, [data]);

  // Miniatures : rendues une fois le document charge.
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      for (let n = 1; n <= doc.numPages && !cancelled; n += 1) {
        const canvas = thumbs.current.get(n);
        if (canvas) await renderPage(doc, n, canvas, 118);
      }
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [doc]);

  // Page agrandie, a la largeur disponible.
  useEffect(() => {
    if (!doc || !bigRef.current) return;
    const width = Math.min(820, (frameRef.current?.clientWidth ?? 820) - 24);
    renderPage(doc, current, bigRef.current, Math.max(240, width)).catch(() => {});
  }, [doc, current]);

  if (failed) {
    return (
      <p className="px-5 py-8 text-[13px] text-ink-58">
        L&apos;aperçu ne peut pas être affiché dans ce navigateur. Utilisez « Ouvrir en plein écran ».
      </p>
    );
  }

  if (!doc) {
    return (
      <p className="flex items-center gap-2 px-5 py-8 text-[13px] text-ink-58">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        Mise en page de l&apos;aperçu…
      </p>
    );
  }

  const pages = Array.from({ length: doc.numPages }, (_, i) => i + 1);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div ref={frameRef} className="min-w-0">
        <div className="mb-2 flex items-center justify-center gap-3 text-[13px] text-ink-58">
          <button
            type="button"
            onClick={() => setCurrent((p) => Math.max(1, p - 1))}
            disabled={current === 1}
            aria-label="Page précédente"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <span className="tabular">
            Page {current} sur {doc.numPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrent((p) => Math.min(doc.numPages, p + 1))}
            disabled={current === doc.numPages}
            aria-label="Page suivante"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="flex justify-center rounded-[10px] bg-paper p-3">
          <canvas ref={bigRef} className="max-w-full bg-white shadow-[0_2px_12px_rgba(16,24,40,0.12)]" />
        </div>
      </div>

      <ol className="grid max-h-[900px] grid-cols-3 content-start gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-2">
        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => setCurrent(n)}
              aria-label={`Afficher la page ${n}`}
              aria-current={current === n ? "page" : undefined}
              className={cn(
                "block w-full rounded-[6px] border-2 bg-white p-0.5 transition-colors",
                current === n ? "border-brand" : "border-transparent hover:border-line",
              )}
            >
              <canvas
                ref={(el) => {
                  if (el) thumbs.current.set(n, el);
                }}
                className="mx-auto block max-w-full"
              />
              <span className="tabular mt-1 block text-center text-[11px] text-ink-42">{n}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
