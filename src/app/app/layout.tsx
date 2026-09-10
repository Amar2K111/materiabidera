import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandLogo";
import { LogOut } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { getAppContext } from "@/lib/data/context";
import { SidebarNav } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { SetupRequired } from "@/components/app/setup-required";

/** Page authentifiee : toujours rendue a la demande, jamais prerendue. */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) return <SetupRequired />;

  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  // Sans organisation, la base entreprise n'existe pas : l'onboarding est
  // le seul passage possible (section 39).
  if (!ctx.organization) redirect("/onboarding");

  const initials = (ctx.organization.name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-white">
      {/* Barre superieure */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b border-line bg-white/90 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />
          <Link href="/app" className="flex flex-none items-center">
            <BrandMark size={22} />
          </Link>
          <span className="truncate text-[13px] font-semibold text-ink-58">
            {ctx.organization.name}
          </span>
        </div>

        <div className="flex flex-none items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-wash text-[11.5px] font-bold text-brand"
            title={ctx.email ?? undefined}
            aria-hidden
          >
            {initials}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 transition-colors hover:bg-paper hover:text-ink"
              aria-label="Se deconnecter"
              title="Se deconnecter"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* Navigation laterale, persistante sur bureau */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-[228px] flex-none border-r border-line bg-paper px-3 py-4 lg:block">
          <SidebarNav />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
