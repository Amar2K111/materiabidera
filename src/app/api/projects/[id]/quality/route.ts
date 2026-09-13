import { NextResponse, type NextRequest } from "next/server";
import { requireProjectAccess } from "@/lib/supabase/admin";
import { runQualityCheck } from "@/lib/services/quality";
import { AiError, isAiConfigured } from "@/lib/ai";

export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const access = await requireProjectAccess(id);
  if (!access) {
    return NextResponse.json(
      { message: "Dossier introuvable ou accès refusé." },
      { status: 404 },
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        message:
          "Le moteur d'analyse n'est pas configuré. Le contrôle ne peut pas être lancé.",
      },
      { status: 503 },
    );
  }

  try {
    const outcome = await runQualityCheck({
      organizationId: access.organizationId,
      projectId: access.projectId,
    });
    return NextResponse.json({ outcome });
  } catch (error) {
    if (error instanceof AiError) {
      const status =
        error.kind === "rate_limited" ? 429 : error.kind === "conflict" ? 409 : 503;
      return NextResponse.json({ message: error.userMessage }, { status });
    }
    return NextResponse.json(
      { message: "Le contrôle n'a pas pu aboutir." },
      { status: 500 },
    );
  }
}
