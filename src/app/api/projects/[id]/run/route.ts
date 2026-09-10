import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireProjectAccess } from "@/lib/supabase/admin";
import { AiError, isAiConfigured } from "@/lib/ai";
import { analyzeProject } from "@/lib/services/analyze";
import { runGoNoGo } from "@/lib/services/go-no-go";
import { runStrategy } from "@/lib/services/strategy";
import { runMemoryPlan } from "@/lib/services/memory-plan";
import { writeSection } from "@/lib/services/memory-writer";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 300;

const BodySchema = z.object({
  operation: z.enum(["analyze", "go-no-go", "strategy", "plan", "section"]),
  sectionId: z.string().uuid().optional(),
  action: z
    .enum(["generate", "improve", "shorten", "expand", "concrete"])
    .optional(),
});

/**
 * Point d'entree unique des operations d'analyse et de redaction.
 *
 * Chaque appel verifie d'abord que l'utilisateur a bien acces au dossier :
 * c'est le seul controle avant tout travail en cle de service.
 */
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
    return NextResponse.json(
      { message: "Demande invalide." },
      { status: 400 },
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        message:
          "Le moteur d'analyse n'est pas configure. L'operation ne peut pas etre lancee.",
      },
      { status: 503 },
    );
  }

  const scope = {
    organizationId: access.organizationId,
    projectId: access.projectId,
  };

  try {
    switch (parsed.data.operation) {
      case "analyze": {
        const admin = createAdminClient();
        const { data: project } = await admin
          .from("projects")
          .select("name")
          .eq("id", access.projectId)
          .single();

        const outcome = await analyzeProject({
          ...scope,
          projectName: (project?.name as string) ?? "Consultation",
        });
        return NextResponse.json({ outcome });
      }

      case "go-no-go":
        return NextResponse.json({ outcome: await runGoNoGo(scope) });

      case "strategy":
        return NextResponse.json({ outcome: await runStrategy(scope) });

      case "plan":
        return NextResponse.json({ outcome: await runMemoryPlan(scope) });

      case "section": {
        if (!parsed.data.sectionId) {
          return NextResponse.json(
            { message: "Chapitre non precise." },
            { status: 400 },
          );
        }
        const outcome = await writeSection({
          ...scope,
          sectionId: parsed.data.sectionId,
          action: parsed.data.action ?? "generate",
        });
        return NextResponse.json({ outcome });
      }
    }
  } catch (error) {
    if (error instanceof AiError) {
      const status =
        error.kind === "rate_limited"
          ? 429
          : error.kind === "conflict"
            ? 409
            : 503;
      return NextResponse.json({ message: error.userMessage }, { status });
    }

    return NextResponse.json(
      { message: "L'operation n'a pas pu aboutir. Rien n'a ete enregistre." },
      { status: 500 },
    );
  }
}
