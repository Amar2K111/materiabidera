"use client";

import { useSyncExternalStore } from "react";
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

  const toggleLabel = collapsed ? "D\u00e9velopper le menu" : "Replier le menu";

  return (
    <aside className={cn("app-ui__sidebar", collapsed && "is-collapsed")}>
      <div className="app-ui__sidebar-top">
        <Link
          href="/app"
          className="app-ui__sidebar-brand"
          aria-label="MateriaBTP — tableau de bord"
          title={collapsed ? "MateriaBTP — tableau de bord" : undefined}
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
        title={collapsed ? "Nouveau dossier" : undefined}
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
            onClick={() => setSidebarCollapsed(false)}
            aria-expanded={false}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <PanelLeftOpen strokeWidth={1.8} aria-hidden />
          </button>
        ) : null}

        <span
          className="app-ui__avatar"
          aria-hidden
          title={collapsed ? organizationName : undefined}
        >
          {initials}
        </span>

        {!collapsed ? (
          <div className="app-ui__sidebar-id app-ui__sidebar-text">
            <p className="app-ui__sidebar-org">{organizationName}</p>
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
              aria-label="Se d\u00e9connecter"
              title="Se d\u00e9connecter"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </form>
        ) : null}
      </div>
    </aside>
  );
}
