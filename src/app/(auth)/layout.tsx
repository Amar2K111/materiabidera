import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/app/setup-required";

/** Page authentifiee : toujours rendue a la demande, jamais prerendue. */
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) return <SetupRequired />;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-[74px] flex-none items-center px-6">
        <Link href="/" className="flex items-center">
          <BrandLogo height={24} />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-20 pt-6 sm:items-center sm:pt-0">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
