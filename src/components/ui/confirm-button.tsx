"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Action destructrice en deux temps.
 *
 * Le premier clic arme l'action et affiche une confirmation explicite ; elle
 * se desarme d'elle-meme apres quelques secondes. Aucune suppression ne part
 * sur un clic unique.
 */
export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel = "Supprimer",
  disabled,
  className,
  children,
}: {
  onConfirm: () => void | Promise<void>;
  /** Libelle accessible du bouton initial. */
  label: string;
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(timer);
  }, [armed]);

  if (armed) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={async () => {
            setArmed(false);
            await onConfirm();
          }}
          className="h-8 rounded-full bg-risk px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-risk/90"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="h-8 rounded-full px-2.5 text-[12.5px] font-semibold text-ink-58 hover:bg-paper hover:text-ink"
        >
          Annuler
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-risk-wash hover:text-risk disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}
