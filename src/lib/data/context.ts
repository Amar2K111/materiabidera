import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

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
  organization: Organization | null;
  role: MemberRole | null;
};

/**
 * Contexte de la requete : utilisateur, organisation active et role.
 *
 * Mis en cache pour la duree du rendu : plusieurs composants peuvent
 * l'appeler sans multiplier les allers-retours vers la base.
 */
export const getAppContext = cache(async (): Promise<AppContext | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Les policies RLS restreignent deja la lecture aux organisations
  // dont l'utilisateur est membre.
  const { data: membership } = await supabase
    .from("organization_members")
    .select(
      "role, organizations (id, name, activity_type, presentation, intervention_area, onboarding_completed_at)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const organization = (membership?.organizations ??
    null) as Organization | null;

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    organization,
    role: (membership?.role as MemberRole | undefined) ?? null,
  };
});
