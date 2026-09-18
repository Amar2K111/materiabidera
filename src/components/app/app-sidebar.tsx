"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";
import { SidebarNav } from "@/components/app/sidebar";
import {
  getSidebarCollapsed,
  getSidebarCollapsedOnServer,
  setSidebarCollapsed,
  subscribeSidebar,
} from "@/lib/sidebar-preference";
import { cn } from "@/lib/utils/cn";

type RailTip = { label: string; top: number; left: number };

export function AppSidebar({
  organizationName,
  email,
  initials,
  isGuest,
}: {
  organizationName: string;
  email: string | null;
  initials: string;
  isGuest: boolean;
}) {
  // La preference vit hors de React : elle est deja appliquee sur <html> avant
  // le premier affichage, et l'attribut de mise en page suit le meme etat.
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarCollapsed,
    getSidebarCollapsedOnServer,
  );

  // Barre repliee : le nom de chaque icone s'affiche au survol ET au clavier.
  // L'infobulle native (attribut title) arrive tard et jamais au clavier : un
  // utilisateur qui tabule dans la barre ne voyait que des pictogrammes.
  // Positionnee en fixe pour ne pas etre coupee par le defilement de la barre.
  const [tip, setTip] = useState<RailTip | null>(null);

  function showTip(target: EventTarget | null) {
    if (!collapsed) return;
    const el = (target as HTMLElement | null)?.closest?.("[data-rail-label]") as
      | HTMLElement
      | null;
    if (!el) {
      setTip(null);
      return;
    }
    const r = el.getBoundingClientRect();
    // Accrochee au bord de la barre, et non de l'icone : elle ne chevauche
    // jamais la barre, quelle que soit la largeur de l'element survole.
    const edge = el.closest("aside")?.getBoundingClientRect().right ?? r.right;
    setTip({
      label: el.dataset.railLabel ?? "",
      top: r.top + r.height / 2,
      left: edge + 10,
    });
  }

  const toggleLabel = collapsed ? "Développer le menu" : "Replier le menu";
  const rail = (label: string) => (collapsed ? { "data-rail-label": label } : {});

  return (
    <aside
      className={cn("app-ui__sidebar", collapsed && "is-collapsed")}
      onMouseOver={(e) => showTip(e.target)}
      onMouseLeave={() => setTip(null)}
      onFocus={(e) => showTip(e.target)}
      onBlur={() => setTip(null)}
      onScroll={() => setTip(null)}
      onKeyDown={(e) => {
        // Une infobulle doit pouvoir etre fermee sans deplacer le pointeur.
        if (e.key === "Escape") setTip(null);
      }}
    >
      <div className="app-ui__sidebar-top">
        <Link
          href="/app"
          className="app-ui__sidebar-brand"
          aria-label="MateriaBTP — tableau de bord"
          {...rail("Tableau de bord")}
        >
          {collapsed ? (
            <span className="app-ui__sidebar-mark-tile">
              <BrandMark size={36} priority decorative className="app-ui__sidebar-mark" />
            </span>
          ) : (
            <BrandLogo height={28} priority />
          )}
        </Link>

        {!collapsed ? (
          <button
            type="button"
            className="app-ui__sidebar-toggle"
            onClick={() => setSidebarCollapsed(true)}
            aria-expanded
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <PanelLeftClose strokeWidth={1.8} aria-hidden />
          </button>
        ) : null}
      </div>

      <Link
        href="/app/dossiers/nouveau"
        className="app-ui__sidebar-cta"
        aria-label={collapsed ? "Nouveau dossier" : undefined}
        {...rail("Nouveau dossier")}
      >
        <Plus strokeWidth={2.2} aria-hidden />
        <span className="app-ui__sidebar-text">Nouveau dossier</span>
      </Link>

      <div className="app-ui__sidebar-nav">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="app-ui__sidebar-foot">
        {collapsed ? (
          <button
            type="button"
            className="app-ui__sidebar-rail-btn app-ui__sidebar-rail-btn--toggle"
            onClick={() => {
              setTip(null);
              setSidebarCollapsed(false);
            }}
            aria-expanded={false}
            aria-label={toggleLabel}
            {...rail(toggleLabel)}
          >
            <PanelLeftOpen strokeWidth={1.8} aria-hidden />
          </button>
        ) : null}

        <span className="app-ui__avatar" aria-hidden {...rail(organizationName)}>
          {initials}
        </span>

        {!collapsed ? (
          <div className="app-ui__sidebar-id app-ui__sidebar-text">
            {/* Nom complet au survol : il est souvent tronque sur 248 px. */}
            <p className="app-ui__sidebar-org" title={organizationName}>
              {organizationName}
            </p>
            {email ? (
              <p className="app-ui__sidebar-email" title={email}>
                {email}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isGuest ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={cn(
                "app-ui__sidebar-logout",
                collapsed && "app-ui__sidebar-rail-btn",
              )}
              aria-label="Se déconnecter"
              title={collapsed ? undefined : "Se déconnecter"}
              {...rail("Se déconnecter")}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </form>
        ) : null}
      </div>

      {collapsed && tip ? (
        <span
          className="app-ui__rail-tip"
          style={{ top: tip.top, left: tip.left }}
          aria-hidden
        >
          {tip.label}
        </span>
      ) : null}
    </aside>
  );
}
