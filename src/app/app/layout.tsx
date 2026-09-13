import Link from "next/link";
import { BrandLogo, BrandMark } from "@/components/brand/BrandLogo";
import { LogOut } from "lucide-react";
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

  const initials = (ctx.fullName || ctx.organization.name || "?")
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

        <div className="app-ui__sidebar-nav">
          <p className="app-ui__nav-label">Navigation</p>
          <SidebarNav />
        </div>

        <div className="app-ui__sidebar-foot">
          <p className="app-ui__sidebar-org">{ctx.organization.name}</p>
          <div className="app-ui__sidebar-user">
            <span
              className="app-ui__avatar"
              title={ctx.email ?? undefined}
              aria-hidden
            >
              {initials}
            </span>
            {!ctx.isGuest ? (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="app-ui__sidebar-logout"
                  aria-label="Se deconnecter"
                  title="Se deconnecter"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </form>
            ) : null}
          </div>
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
                  aria-label="Se deconnecter"
                  title="Se deconnecter"
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
