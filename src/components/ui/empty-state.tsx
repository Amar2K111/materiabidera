import * as React from "react";

/**
 * Etat vide (section 42) : dire ce que contient la page, pourquoi c'est utile,
 * et comment commencer. Jamais un simple "Aucune donnee".
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border border-dashed border-line px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-wash text-brand">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[16px] font-bold">{title}</h3>
      <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-ink-58">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
