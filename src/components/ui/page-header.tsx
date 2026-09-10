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
      <div className="min-w-0">
        <h1 className="text-[26px] font-extrabold tracking-[-0.035em]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[70ch] text-[14px] text-ink-58">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex-none">{action}</div> : null}
    </header>
  );
}
