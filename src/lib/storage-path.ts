/**
 * Un fichier appartient a une organisation si son chemin commence par le
 * dossier de celle-ci ("<organisation>/...") et ne remonte jamais au-dessus.
 *
 * Module pur : utilisable cote serveur et dans les tests.
 */
export function isOwnStoragePath(path: string | null | undefined, organizationId: string): boolean {
  if (!path || !organizationId) return false;
  const segments = path.split("/");
  return (
    segments.length >= 2 &&
    segments[0] === organizationId &&
    segments.every((s) => s.length > 0 && s !== "." && s !== ".." && !s.includes("\\"))
  );
}
