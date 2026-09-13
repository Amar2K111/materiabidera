import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureDemoSessionMiddleware } from "@/lib/demo-session-middleware";
import { getServiceRoleKey, isSupabaseConfigured, supabaseConfig } from "@/lib/env";

/** Pages auth / onboarding : redirigees vers l'app (pas de login requis). */
const AUTH_BYPASS_PATHS = ["/login", "/signup", "/onboarding"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // Sans configuration Supabase, l'application ne peut pas authentifier.
  // On laisse passer : les pages concernees affichent un etat explicite
  // "connexion non configuree" plutot qu'une erreur technique.
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Rafraichit la session. Ne rien inserer entre la creation du client
  // et cet appel : la session serait perdue de maniere aleatoire.
  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && getServiceRoleKey()) {
    const ok = await ensureDemoSessionMiddleware(supabase);
    if (ok) {
      ({
        data: { user },
      } = await supabase.auth.getUser());
    }
  }

  if (
    AUTH_BYPASS_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
