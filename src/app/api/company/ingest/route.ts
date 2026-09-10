import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppContext } from "@/lib/data/context";
import { ingestNextCompanyDocument } from "@/lib/services/ingest-company";
import { getServiceRoleKey } from "@/lib/env";

export const maxDuration = 300;

/** Lit la piece suivante de la bibliotheque entreprise, puis rend la main. */
export async function POST() {
  const ctx = await getAppContext();
  // Sans session ou sans configuration serveur, on refuse proprement plutot
  // que de laisser remonter une erreur technique (section 26).
  if (!ctx?.organization || !getServiceRoleKey()) {
    return NextResponse.json(
      {
        message:
          "Session expiree ou service indisponible. Reconnectez-vous puis reessayez.",
      },
      { status: 401 },
    );
  }

  const organizationId = ctx.organization.id;

  try {
    const processed = await ingestNextCompanyDocument({ organizationId });

    const admin = createAdminClient();
    const { count } = await admin
      .from("company_documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "UPLOADED");

    return NextResponse.json({
      processed,
      remaining: count ?? 0,
      done: processed === null && (count ?? 0) === 0,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "La lecture des documents a echoue. Merci de relancer dans un instant.",
      },
      { status: 500 },
    );
  }
}
