import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ensureDemoSession } from "@/lib/demo-session";

export type MemberRole = "owner" | "admin" | "member";

export type Organization = {
  id: string;
  name: string;
  activity_type: string | null;
  presentation: string | null;
  intervention_area: string | null;
  onboarding_completed_at: string | null;
};

export type AppContext = {
  userId: string;
  email: string | null;
  fullName: string | null;
  organization: Organization;
  role: MemberRole | null;
  isGuest: boolean;
};

export const GUEST_USER_ID = "guest";

function guestAppContext(): AppContext {
  return {
    userId: GUEST_USER_ID,
    email: null,
    fullName: "Invité",
    organization: {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Démonstration",
      activity_type: null,
      presentation: null,
      intervention_area: null,
      onboarding_completed_at: new Date().toISOString(),
    },
    role: "owner",
    isGuest: true,
  };
}

function placeholderOrganization(userId: string): Organization {
  return {
    id: userId,
    name: "Mon entreprise",
    activity_type: null,
    presentation: null,
    intervention_area: null,
    onboarding_completed_at: new Date().toISOString(),
  };
}

/**
 * Contexte de la requete : utilisateur, organisation active et role.
 *
 * Mis en cache pour la duree du rendu : plusieurs composants peuvent
 * l'appeler sans multiplier les allers-retours vers la base.
 *
 * Sans session : tente une connexion demo silencieuse, sinon contexte invite.
 */
export const getAppContext = cache(async (): Promise<AppContext> => {
  if (!isSupabaseConfigured) return guestAppContext();

  const supabase = await createClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await ensureDemoSession();
    ({
      data: { user },
    } = await supabase.auth.getUser());
  }

  if (!user) return guestAppContext();

  const { data: membership } = await supabase
    .from("organization_members")
    .select(
      "role, organizations (id, name, activity_type, presentation, intervention_area, onboarding_completed_at)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const organization =
    ((membership?.organizations ?? null) as Organization | null) ??
    placeholderOrganization(user.id);

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    organization,
    role: (membership?.role as MemberRole | undefined) ?? "owner",
    isGuest: false,
  };
});
