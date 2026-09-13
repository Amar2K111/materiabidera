import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Sert index.html (landing statique MateriaBTP) à la racine via rewrite. */
export async function GET() {
  const filePath = path.join(process.cwd(), "index.html");
  const html = await readFile(filePath, "utf8");

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
