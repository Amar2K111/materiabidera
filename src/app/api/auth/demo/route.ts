import { NextResponse } from "next/server";
import { ensureDemoSession } from "@/lib/demo-session";
import { getServiceRoleKey } from "@/lib/env";
import { isDemoAccessEnabled } from "@/lib/demo-access";

export async function POST() {
  if (!isDemoAccessEnabled()) {
    return NextResponse.json({ error: "Accès démo indisponible." }, { status: 403 });
  }

  if (!getServiceRoleKey()) {
    return NextResponse.json(
      { error: "Supabase non configuré (clé service role manquante)." },
      { status: 503 },
    );
  }

  const ok = await ensureDemoSession();
  if (!ok) {
    return NextResponse.json(
      { error: "Impossible de préparer la session demo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
