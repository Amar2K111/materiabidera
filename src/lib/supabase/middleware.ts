import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureDemoSessionMiddleware } from "@/lib/demo-session-middleware";
import { getServiceRoleKey, isSupabaseConfigured, supabaseConfig } from "@/lib/env";
import { isDemoAccessEnabled } from "@/lib/demo-access";

/** Prefixes reserves aux utilisateurs authentifies. */
const PROTECTED_PREFIXES = ["/app", "/onboarding"];

/** Pages d'authentification : inutiles une fois connecte. */
const AUTH_PATHS = ["/login", "/signup"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

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

  const demo = isDemoAccessEnabled();

  // Mode demo (local, ou active explicitement) : connexion silencieuse.
  if (!user && demo && getServiceRoleKey()) {
    const ok = await ensureDemoSessionMiddleware(supabase);
    if (ok) {
      ({
        data: { user },
      } = await supabase.auth.getUser());
    }
  }

  // Hors demo, l'application exige une vraie session.
  if (!user && matches(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("suite", pathname);
    return NextResponse.redirect(url);
  }

  // Connecte (y compris par la demo), les pages de connexion renvoient vers
  // l'app. Si la connexion demo a echoue, la page de connexion reste
  // accessible : pas de boucle de redirection.
  if (user && matches(pathname, AUTH_PATHS)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
