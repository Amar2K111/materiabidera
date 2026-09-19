import { Lock, Server, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Uniquement des engagements verifiables. La region d'hebergement des donnees
// n'est pas affichee tant qu'elle n'a pas ete confirmee dans la console
// Supabase ; le chiffrement au repos est celui de Supabase (AES-256).
const TRUST_ITEMS = [
  { label: "Isolation par entreprise", icon: ShieldCheck },
  { label: "Chiffrement en transit et au repos", icon: Lock },
  { label: "Sources citées", icon: Server },
  { label: "Aucun entraînement par MateriaBTP sur vos documents", icon: Sparkles },
] as const;

/** Rappel discret des engagements de confidentialite. */
export function TrustPills({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-42",
        className,
      )}
    >
      {TRUST_ITEMS.map(({ label, icon: Icon }) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
