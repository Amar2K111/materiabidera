import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Echange le code OAuth ou le lien de confirmation contre une session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const suite = searchParams.get("suite");
  const destination = suite && suite.startsWith("/") ? suite : "/app";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?erreur=lien_invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?erreur=lien_expire`);
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
