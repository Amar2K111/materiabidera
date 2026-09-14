import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

/**
 * Chemin relatif sur, ou null : aucun segment vide, "." , ".." ou separateur.
 * Le dossier racine reste ecrit en toutes lettres dans les appels au systeme
 * de fichiers, pour que seul materiabtp-assets/ soit embarque au deploiement
 * (et non tout le projet).
 */
function safeRelative(segments: string[]): string | null {
  const ok = segments.every(
    (s) => s.length > 0 && s !== "." && s !== ".." && !/[\\/\0:]/.test(s),
  );
  return ok && segments.length > 0 ? segments.join("/") : null;
}

/** Sert materiabtp-assets/ pour la landing statique. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const relative = safeRelative(segments);

  if (!relative) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const info = await stat(path.join(process.cwd(), "materiabtp-assets", relative));
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await readFile(path.join(process.cwd(), "materiabtp-assets", relative));
    const ext = path.extname(relative).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        // Fichiers non versionnes (pas d'empreinte dans le nom) : un cache
        // "immutable" d'un an empecherait toute mise a jour d'une image.
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
