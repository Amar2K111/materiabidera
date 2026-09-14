"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Etablit la session demo cote client quand le serveur n'a pas encore
 * recu les cookies (premiere requete apres connexion silencieuse).
 */
export function SessionBootstrap({ isGuest }: { isGuest: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  // Un visiteur authentifie n'a rien a initialiser.
  const pending = isGuest && !done;

  useEffect(() => {
    if (!isGuest) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/demo", { method: "POST" });
        if (!cancelled && res.ok) router.refresh();
      } finally {
        if (!cancelled) setDone(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isGuest, router]);

  if (!pending) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] border-b border-brand/20 bg-brand/10 px-4 py-2.5 text-center text-[13px] font-semibold text-brand"
      role="status"
    >
      Initialisation de la session...
    </div>
  );
}
