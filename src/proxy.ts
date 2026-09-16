import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/materiabtp-assets/")) {
    const assetPath = pathname.slice("/materiabtp-assets/".length);
    return NextResponse.rewrite(
      new URL(`/api/materiabtp-assets/${assetPath}`, request.url),
    );
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Assets landing hors de public/ : materiabtp-assets/* (png, svg, css embarqué…).
     * Le matcher général exclut les extensions image pour éviter le proxy sur public/.
     */
    "/materiabtp-assets/:path*",
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
