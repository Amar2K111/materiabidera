import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireProjectAccess } from "@/lib/supabase/admin";
import { ExportError, exportMemory } from "@/lib/services/export";

export const maxDuration = 300;

const BodySchema = z.object({
  format: z.enum(["DOCX", "PDF"]),
  includeSources: z.boolean().default(true),
});

export async function POST(
  request: NextRequest,
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

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Demande invalide." }, { status: 400 });
  }

  try {
    const result = await exportMemory({
      organizationId: access.organizationId,
      projectId: access.projectId,
      userId: access.userId,
      format: parsed.data.format,
      includeSources: parsed.data.includeSources,
    });
    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof ExportError) {
      return NextResponse.json({ message: error.userMessage }, { status: 409 });
    }
    return NextResponse.json(
      { message: "L'export n'a pas pu aboutir." },
      { status: 500 },
    );
  }
}
