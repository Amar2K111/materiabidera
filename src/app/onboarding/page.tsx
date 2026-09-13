import { redirect } from "next/navigation";

/** Page authentifiee : toujours rendue a la demande, jamais prerendue. */
export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  redirect("/app");
}
