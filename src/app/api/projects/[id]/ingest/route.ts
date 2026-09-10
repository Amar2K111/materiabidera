import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, requireProjectAccess } from "@/lib/supabase/admin";
import { ingestNextDocument } from "@/lib/services/ingest";

export const maxDuration = 300;

/**
 * Traite la piece suivante en attente, puis rend la main.
 *
 * Le client rappelle cette route tant que "remaining" est superieur a zero.
 * La progression affichee correspond donc a un travail reellement effectue.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const access = await requireProjectAccess(id);
  if (!access) {
    return NextResponse.json(
      { message: "Dossier introuvable ou acces refuse." },
      { status: 404 },
    );
  }

  try {
    const outcome = await ingestNextDocument({
      organizationId: access.organizationId,
      projectId: access.projectId,
    });

    const admin = createAdminClient();
    const { count } = await admin
      .from("project_documents")
      .select("id", { count: "exact", head: true })
      .eq("project_id", access.projectId)
      .eq("status", "UPLOADED");

    return NextResponse.json({
      processed: outcome,
      remaining: count ?? 0,
      done: outcome === null && (count ?? 0) === 0,
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
