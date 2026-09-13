import { NextResponse } from "next/server";
import { ensureDemoSession } from "@/lib/demo-session";
import { getServiceRoleKey } from "@/lib/env";

export async function POST() {
  if (!getServiceRoleKey()) {
    return NextResponse.json(
      { error: "Supabase non configure (cle service role manquante)." },
      { status: 503 },
    );
  }

  const ok = await ensureDemoSession();
  if (!ok) {
    return NextResponse.json(
      { error: "Impossible de preparer la session demo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
