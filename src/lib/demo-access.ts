/** Acces demo : actif en local ou si explicitement active via env. */
export function isDemoAccessEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_DEMO_ACCESS === "true"
  );
}

/** Version utilisable cote client (NEXT_PUBLIC_ pour override explicite). */
export function isDemoAccessEnabledClient() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCESS === "true") return true;
  return process.env.NODE_ENV === "development";
}
