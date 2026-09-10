import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/env";

/**
 * Client Supabase serveur, adosse aux cookies de session.
 * Toutes les requetes passent par les policies RLS : l'isolation entre
 * organisations est appliquee par la base, pas par le code applicatif.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appele depuis un Server Component : le rafraichissement de session
          // est alors assure par le middleware. Rien a faire ici.
        }
      },
    },
  });
}
