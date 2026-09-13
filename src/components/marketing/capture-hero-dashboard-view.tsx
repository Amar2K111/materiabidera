import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Library,
  Settings,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CAPTURE_HERO } from "@/lib/marketing/capture-mock-data";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { label: "Tableau de bord", icon: LayoutDashboard, active: true, accent: "is-accent-blue" },
  { label: "Dossiers", icon: FolderKanban, active: false, accent: "is-accent-amber" },
  { label: "Base entreprise", icon: Building2, active: false, accent: "is-accent-purple" },
  { label: "Bibliotheque", icon: Library, active: false, accent: "is-accent-teal" },
  { label: "Parametres", icon: Settings, active: false, accent: "is-accent-blue" },
] as const;

export function CaptureHeroDashboardView() {
  const { orgName, initials, metrics, projects } = CAPTURE_HERO;

  return (
    <div className="capture-hero-scene app-ui app-ui__shell">
      <aside className="app-ui__sidebar">
        <Link href="/app" className="app-ui__sidebar-brand" tabIndex={-1}>
          <BrandLogo height={24} variant="on-dark" />
        </Link>

        <div className="app-ui__sidebar-nav">
          <p className="app-ui__nav-label">Application</p>
          <nav className="app-ui__nav" aria-label="Navigation">
            {NAV.map(({ label, icon: Icon, active, accent }) => (
              <span
                key={label}
                className={cn(
                  "app-ui__nav-link",
                  active && "is-active",
                  active && accent,
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
            <div>
              <h1 className="app-ui__page-title capture-hero-scene__title">
                Tableau de bord
              </h1>
              <p className="app-ui__page-lead capture-hero-scene__lead">
                Voici l&apos;etat de vos reponses aux appels d&apos;offres BTP.
              </p>
            </div>
            <span className="capture-hero-scene__cta">+ Nouveau dossier</span>
          </header>

          <div className="app-ui__metrics app-ui__metrics--4 capture-hero-scene__metrics">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={`app-ui__metric${m.tone ? ` ${m.tone}` : ""}`}
              >
                <b>{m.value}</b>
                <span>{m.label}</span>
              </div>
            ))}
          </div>

          <section className="capture-hero-scene__section">
            <div className="capture-hero-scene__section-head">
              <h2>Dossiers recents</h2>
              <span>Tout voir</span>
            </div>
            <ul className="app-ui__card-grid capture-hero-scene__cards">
              {projects.map((project) => (
                <li key={project.name}>
                  <div className="app-ui__project-card">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-semibold leading-snug tracking-[-0.015em]">
                        {project.name}
                      </h3>
                      <span className={`app-ui__tag ${project.status.tone}`}>
                        {project.status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] text-ink-58">
                      {[project.buyer, project.lot].join(" | ")}
                    </p>
                    <div className="mt-3 flex items-center gap-4 border-t border-line-soft pt-2.5">
                      <div>
                        <p className="text-[10px] font-bold text-ink-42">Go / No-Go</p>
                        <p className="mt-0.5 flex items-baseline gap-1">
                          <span
                            className={cn(
                              "tabular text-[14px] font-extrabold",
                              project.decision.tone === "is-ok" && "text-ok",
                              project.decision.tone === "is-warn" && "text-warn",
                            )}
                          >
                            {project.score}
                          </span>
                          <span className="text-[10px] font-bold text-ink-42">
                            {project.decision.label}
                          </span>
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-ink-42">Memoire</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="app-ui__bar h-1 flex-1">
                            <i style={{ width: `${project.memoryProgress}%` }} />
                          </span>
                          <span className="tabular text-[10.5px] font-bold">
                            {project.memoryProgress} %
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-ink-42">{project.deadline}</span>
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          project.due.tone === "warn" && "font-bold text-warn",
                          project.due.tone === "neutral" && "text-ink-58",
                        )}
                      >
                        {project.due.text}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
