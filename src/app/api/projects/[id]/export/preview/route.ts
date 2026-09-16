import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireProjectAccess } from "@/lib/supabase/admin";
import { ExportError, previewMemory } from "@/lib/services/export";

export const maxDuration = 300;

const BodySchema = z.object({
  includeSources: z.boolean().default(false),
  includeAnnexes: z.boolean().default(true),
});

/**
 * Apercu du document final avant telechargement : PDF produit et controle a
 * la volee, sans enregistrement ni changement de statut du dossier.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const access = await requireProjectAccess(id);
  if (!access) {
    return NextResponse.json({ message: "Dossier introuvable ou accès refusé." }, { status: 404 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: "Demande invalide." }, { status: 400 });
  }

  try {
    const preview = await previewMemory({
      organizationId: access.organizationId,
      projectId: access.projectId,
      ...parsed.data,
    });
    return NextResponse.json({ preview });
  } catch (error) {
    if (error instanceof ExportError) {
      return NextResponse.json({ message: error.userMessage }, { status: 409 });
    }
    return NextResponse.json({ message: "L'aperçu n'a pas pu être produit." }, { status: 500 });
  }
}
