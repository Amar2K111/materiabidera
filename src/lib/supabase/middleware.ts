import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/env";

/** Prefixes reserves aux utilisateurs authentifies. */
const PROTECTED_PREFIXES = ["/app", "/onboarding"];

/** Pages d'authentification : inaccessibles une fois connecte. */
const AUTH_PATHS = ["/login", "/signup"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("suite", pathname);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
