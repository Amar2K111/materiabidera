import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleKey, isSupabaseConfigured } from "@/lib/env";
import { isDemoAccessEnabled } from "@/lib/demo-access";

const DEFAULT_DEMO_EMAIL = "admin@materiabidera.fr";

/** Etablit silencieusement une session demo Supabase si aucune session n'existe. */
export async function ensureDemoSession(): Promise<boolean> {
  if (!isDemoAccessEnabled()) return false;
  if (!isSupabaseConfigured || !getServiceRoleKey()) return false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return true;

    const email = (process.env.DEMO_LOGIN_EMAIL ?? DEFAULT_DEMO_EMAIL).trim();
    const admin = createAdminClient();

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) return false;

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    return !verifyError;
  } catch {
    return false;
  }
}
