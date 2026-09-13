import { cn } from "@/lib/utils/cn";

const TRUST_ITEMS = [
  { label: "Hébergement UE", tone: "is-blue" },
  { label: "Isolation par entreprise", tone: "is-amber" },
  { label: "Chiffrement AES-256", tone: "is-purple" },
  { label: "Pas d'entraînement IA", tone: "is-teal" },
] as const;

export function TrustPills({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {TRUST_ITEMS.map(({ label, tone }) => (
        <span key={label} className={cn("app-ui__pill", tone)}>
          {label}
        </span>
      ))}
    </div>
  );
}
