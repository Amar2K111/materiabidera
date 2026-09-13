import { ArrowRight, FolderPlus } from "lucide-react";
import {
  LayoutDashboard,
  FolderOpen,
  Building2,
  Library,
  Settings,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { CAPTURE_HERO } from "@/lib/marketing/capture-mock-data";
import { PROJECT_STATUS } from "@/lib/projects";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { label: "Tableau de bord", icon: LayoutDashboard, active: true },
  { label: "Dossiers", icon: FolderOpen, active: false },
  { label: "Base entreprise", icon: Building2, active: false },
  { label: "Bibliothèque", icon: Library, active: false },
  { label: "Paramètres", icon: Settings, active: false },
] as const;

const RECOMMENDATION = {
  GO: { label: "GO", tone: "ok" as const },
  VIGILANCE: { label: "Sous réserve", tone: "warn" as const },
  NO_GO: { label: "NO-GO", tone: "risk" as const },
};

export function CaptureHeroDashboardView() {
  const { orgName, initials, metrics, projects } = CAPTURE_HERO;

  return (
    <div className="capture-hero-scene app-ui app-ui__shell">
      <aside className="app-ui__sidebar">
        <span className="app-ui__sidebar-brand" tabIndex={-1}>
          <BrandLogo height={28} />
        </span>

        <div className="app-ui__sidebar-nav">
          <p className="app-ui__nav-label">Navigation</p>
          <nav className="app-ui__nav" aria-label="Navigation">
            {NAV.map(({ label, icon: Icon, active }) => (
              <span
                key={label}
                className={cn(
                  "app-ui__nav-link",
                  active && "is-active is-accent-blue",
                )}
              >
                <Icon />
                {label}
              </span>
            ))}
          </nav>
        </div>

        <div className="app-ui__sidebar-foot">
          <p className="app-ui__sidebar-org">{orgName}</p>
          <div className="app-ui__sidebar-user">
            <span className="app-ui__avatar" aria-hidden>
              {initials}
            </span>
          </div>
        </div>
      </aside>

      <div className="app-ui__main-col">
        <main className="app-ui__main-wrap capture-hero-scene__main">
          <header className="capture-hero-scene__header">
            <div className="min-w-0">
              <h1 className="app-ui__page-title capture-hero-scene__title">
                Tableau de bord
              </h1>
              <p className="app-ui__page-lead capture-hero-scene__lead">
                De l&apos;analyse du DCE au mémoire technique vérifié — une vue
                claire sur chaque dossier en cours.
              </p>
            </div>
            <span className="capture-hero-scene__cta">
              <FolderPlus className="h-4 w-4" strokeWidth={1.9} />
              Nouveau dossier
            </span>
          </header>

          <div className="app-ui__metrics app-ui__metrics--4 capture-hero-scene__metrics">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={cn("app-ui__metric", m.tone)}
              >
                <b>{m.value}</b>
                <span>{m.label}</span>
              </div>
            ))}
          </div>

          <section className="capture-hero-scene__section">
            <div className="capture-hero-scene__section-head">
              <h2>Dossiers récents</h2>
              <span className="inline-flex items-center gap-1">
                Tous les dossiers
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </div>
            <ul className="app-ui__card-grid capture-hero-scene__cards">
              {projects.map((project) => {
                const status = PROJECT_STATUS[project.status];
                const decision = RECOMMENDATION[project.recommendation];

                return (
                  <li key={project.name}>
                    <div className="app-ui__project-card">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.015em]">
                          {project.name}
                        </h3>
                        <Badge tone={status.tone} className="mt-0.5 flex-none">
                          {status.label}
                        </Badge>
                      </div>

                      <p className="mt-1 line-clamp-1 text-[11.5px] text-ink-58">
                        {[project.buyer, project.lot].join(" · ")}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line-soft pt-2.5">
                        <div>
                          <p className="text-[10.5px] font-medium text-ink-42">
                            Go / No-Go
                          </p>
                          <p className="mt-1 flex items-baseline gap-1">
                            <span
                              className={cn(
                                "tabular text-[15px] font-bold leading-none",
                                decision.tone === "ok" && "text-ok",
                                decision.tone === "warn" && "text-warn",
                              )}
                            >
                              {project.score}
                            </span>
                            <span className="text-[10.5px] font-semibold text-ink-58">
                              {decision.label}
                            </span>
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10.5px] font-medium text-ink-42">
                            Mémoire
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="app-ui__bar h-1 flex-1">
                              <i
                                style={{ width: `${project.memoryProgress}%` }}
                              />
                            </span>
                            <span className="tabular flex-none text-[11px] font-semibold">
                              {project.memoryProgress} %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-[11px]",
                            project.dueTone === "warn" && "font-semibold text-warn",
                            project.dueTone === "neutral" && "text-ink-58",
                          )}
                        >
                          {project.dueText}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
                          {project.nextLabel}
                          <ArrowRight className="h-3 w-3" strokeWidth={2} />
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
