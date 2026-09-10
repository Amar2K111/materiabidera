/**
 * Lecture centralisee de la configuration.
 *
 * Regle produit (section 37 du cahier des charges) : une brique non configuree
 * ne doit jamais etre simulee. Ce module ne leve donc aucune exception a
 * l'import : il expose l'etat reel de la configuration, et l'interface affiche
 * un etat "non configure" explicite lorsque c'est le cas.
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const isSupabaseConfigured =
  supabaseConfig.url.length > 0 && supabaseConfig.anonKey.length > 0;

/** Cle de service : serveur uniquement. Ne jamais importer cote client. */
export function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Etat du fournisseur IA. Evalue cote serveur uniquement. */
export function getAiConfig() {
  const provider = (process.env.AI_PROVIDER ?? "").toLowerCase();
  const keys: Record<string, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  };
  const key = keys[provider];
  return {
    provider: provider || null,
    configured: Boolean(provider && key),
    apiKey: key ?? null,
  };
}

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
