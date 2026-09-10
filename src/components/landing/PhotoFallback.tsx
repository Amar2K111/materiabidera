"use client";

import { useState } from "react";

type Source = { src: string; };

/**
 * Photo avec repli en cascade, puis illustration SVG si aucune ne charge.
 *
 * Reprend le comportement de l'attribut onerror de la page HTML d'origine :
 * la premiere photo est tentee, puis la seconde en secours, puis l'image est
 * simplement retiree pour laisser l'illustration SVG (toujours presente en
 * fond) porter seule le visuel. Jamais de cadre casse.
 */
export function PhotoFallback({
  sources,
  alt,
  illustration,
}: {
  sources: [Source, Source];
  alt: string;
  illustration: React.ReactNode;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  return (
    <>
      {illustration}
      {step < 2 ? (
        <img
          src={sources[step === 0 ? 0 : 1].src}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          alt={alt}
          onError={() => setStep((s) => (s === 0 ? 1 : 2))}
        />
      ) : null}
    </>
  );
}
