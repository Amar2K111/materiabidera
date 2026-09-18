"use client";

import { useEffect, useState } from "react";
import { calendlyEmbedSrc } from "@/lib/marketing/config/calendly";

export function CalendlyEmbed() {
  const [month, setMonth] = useState<string>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const now = new Date();
    setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  }, []);

  if (!month) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="relative min-h-[42rem]">
      {!loaded ? <CalendarSkeleton overlay /> : null}
      <iframe
        src={calendlyEmbedSrc(month)}
        title="Réserver une démo MateriaBTP — 30 minutes"
        className={`h-[42rem] w-full border-0 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function CalendarSkeleton({ overlay }: { overlay?: boolean }) {
  return (
    <div
      aria-hidden={overlay ? true : undefined}
      className={
        overlay
          ? "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white"
          : "flex min-h-[42rem] flex-col items-center justify-center gap-3 bg-white"
      }
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-iris-glow border-t-iris" />
      <span className="text-[13px] text-pewter">Chargement du calendrier…</span>
    </div>
  );
}
