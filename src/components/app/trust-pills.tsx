import { Lock, Server, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TRUST_ITEMS = [
  { label: "Hébergement UE", icon: Server },
  { label: "Isolation par entreprise", icon: ShieldCheck },
  { label: "Chiffrement AES-256", icon: Lock },
  { label: "Pas d'entraînement IA sur vos données", icon: Sparkles },
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
