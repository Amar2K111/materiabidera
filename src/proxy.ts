import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf les fichiers statiques et les images.
     * La landing page (public/landing.html) est volontairement exclue :
     * elle reste accessible sans session.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|landing\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
