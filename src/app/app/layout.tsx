import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";
import { LogOut, Plus } from "lucide-react";
import { getAppContext } from "@/lib/data/context";
import { SidebarNav } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { SessionBootstrap } from "@/components/app/session-bootstrap";
import "@/components/app/app-ui.css";

/** Page authentifiee : toujours rendue a la demande, jamais prerendue. */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAppContext();

  // Hors demo, sans session, le middleware a deja renvoye vers la connexion.
  // Un compte sans entreprise passe d'abord par l'onboarding (section 39).
  if (!ctx.isGuest && !ctx.hasOrganization) redirect("/onboarding");

  // Les initiales designent l'entreprise affichee a cote, pas le compte.
  const initials = (ctx.organization.name || ctx.fullName || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app-ui app-ui__shell">
      <SessionBootstrap isGuest={ctx.isGuest} />
      <aside className="app-ui__sidebar">
        <Link href="/app" className="app-ui__sidebar-brand" aria-label="MateriaBTP — tableau de bord">
          <BrandLogo height={28} priority />
        </Link>

        <Link href="/app/dossiers/nouveau" className="app-ui__sidebar-cta">
          <Plus strokeWidth={2.2} aria-hidden />
          Nouveau dossier
        </Link>

        <div className="app-ui__sidebar-nav">
          <SidebarNav />
        </div>

        <div className="app-ui__sidebar-foot">
          <span className="app-ui__avatar" aria-hidden>
            {initials}
          </span>
          <div className="app-ui__sidebar-id">
            <p className="app-ui__sidebar-org">{ctx.organization.name}</p>
            {ctx.email ? (
              <p className="app-ui__sidebar-email" title={ctx.email}>
                {ctx.email}
              </p>
            ) : null}
          </div>
          {!ctx.isGuest ? (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="app-ui__sidebar-logout"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      <div className="app-ui__main-col">
        <header className="app-ui__header">
          <div className="app-ui__header-l">
            <MobileNav />
            <Link href="/app" className="app-ui__header-brand lg:hidden">
              <BrandMark size={22} />
            </Link>
            <span className="app-ui__org lg:hidden">{ctx.organization.name}</span>
          </div>

          <div className="app-ui__header-r lg:hidden">
            <span className="app-ui__avatar" title={ctx.email ?? undefined} aria-hidden>
              {initials}
            </span>
            {!ctx.isGuest ? (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </form>
            ) : null}
          </div>
        </header>

        <main className="app-ui__main-wrap">
          <div className="app-ui__main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
