import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppContext } from "@/lib/data/context";
import { getServiceRoleKey } from "@/lib/env";
import { COLLECTIONS } from "@/lib/company";
import { buildCompanySnapshot } from "@/lib/services/company-context";
import { semanticSimilarities } from "@/lib/services/embeddings";
import { searchItems } from "@/lib/engine/search";

export const maxDuration = 60;

const Body = z.object({ query: z.string().trim().min(2).max(300) });

const SLUG_BY_TABLE = new Map(COLLECTIONS.map((c) => [c.table, c.slug]));

/**
 * Recherche dans la base entreprise de l'organisation courante.
 *
 * L'organisation vient de la session (sous RLS) : le client ne choisit jamais
 * dans quelle base il cherche. Le client de service ne sert qu'ensuite, filtre
 * sur cette organisation, comme pour la redaction.
 */
export async function POST(request: Request) {
  const ctx = await getAppContext();
  if (ctx.isGuest || !getServiceRoleKey()) {
    return NextResponse.json(
      { message: "La recherche n'est pas disponible en mode invité." },
      { status: 401 },
    );
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Saisissez au moins deux caractères." },
      { status: 400 },
    );
  }
  const { query } = parsed.data;
  const organizationId = ctx.organization.id;

  try {
    const admin = createAdminClient();
    const snapshot = await buildCompanySnapshot(admin, organizationId);
    const all = [...snapshot.items, ...snapshot.documents];

    // Le sens est un plus : sans cle ou en cas d'echec, on reste sur les mots.
    const similarities = await semanticSimilarities(
      admin,
      organizationId,
      [query],
      all.map((item) => ({ id: item.id, text: `${item.label}\n${item.text}` })),
    ).catch(() => null);

    const hits = searchItems(query, all, similarities, 12);

    return NextResponse.json({
      semantic: similarities !== null,
      searched: all.length,
      results: hits.map((hit) => {
        const library = hit.table === "company_documents";
        const slug = SLUG_BY_TABLE.get(hit.table);
        return {
          id: hit.id,
          label: hit.label,
          excerpt: hit.excerpt,
          match: hit.match,
          kind: library ? "Bibliothèque" : "Fiche",
          href: library
            ? "/app/bibliotheque"
            : slug
              ? `/app/base-entreprise/${slug}`
              : "/app/base-entreprise",
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { message: "La recherche n'a pas pu aboutir. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
