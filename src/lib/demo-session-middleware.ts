import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_DEMO_EMAIL = "admin@materiabidera.fr";

/** Connexion demo dans le middleware (les cookies peuvent y etre ecrits). */
export async function ensureDemoSessionMiddleware(
  supabase: SupabaseClient,
): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;

  try {
    const email = (process.env.DEMO_LOGIN_EMAIL ?? DEFAULT_DEMO_EMAIL).trim();
    const admin = createSupabaseAdmin(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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
