import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/api/static-landing", request.url));
  }

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
     * Landing statique : toujours réécrire / et materiabtp-assets/* (y compris png/jpg/svg…).
     * Le matcher général exclut les extensions image pour éviter le middleware sur public/,
     * ce qui cassait les assets landing hors de public/.
     */
    "/",
    "/materiabtp-assets/:path*",
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
