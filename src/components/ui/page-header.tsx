import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
      {/* Meme titre que les pages qui n'utilisent pas ce composant : sans cela,
          "Paramètres" s'affichait en 26px extra-gras et "Dossiers" en 30px gras,
          au meme niveau de lecture. */}
      <div className="min-w-0">
        <h1 className="app-ui__page-title">{title}</h1>
        {subtitle ? <p className="app-ui__page-lead">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex-none">{action}</div> : null}
    </header>
  );
}
