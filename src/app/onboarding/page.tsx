import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getAppContext } from "@/lib/data/context";
import { SetupRequired } from "@/components/app/setup-required";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { OnboardingForm } from "./onboarding-form";

/** Page authentifiee : toujours rendue a la demande, jamais prerendue. */
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured) return <SetupRequired />;

  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  if (ctx.organization) redirect("/app");

  return (
    <div className="mx-auto min-h-dvh max-w-[560px] px-6 py-14">
      <BrandLogo height={24} />
      <OnboardingForm />
    </div>
  );
}
